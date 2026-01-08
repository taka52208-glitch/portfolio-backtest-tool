import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Slider,
  IconButton,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Delete, PlayArrow } from '@mui/icons-material';
import { usePortfolioStore } from '../stores/portfolioStore';
import type { Stock } from '../types';
import { searchStocks, runBacktest } from '../utils/api';
import { Layout } from '../components/Layout';

// デモ用のサンプル銘柄データ
const SAMPLE_STOCKS: Stock[] = [
  { code: '7203.T', name: 'トヨタ自動車', market: 'JP' },
  { code: '6758.T', name: 'ソニーグループ', market: 'JP' },
  { code: '9984.T', name: 'ソフトバンクグループ', market: 'JP' },
  { code: '6861.T', name: 'キーエンス', market: 'JP' },
  { code: '9432.T', name: '日本電信電話', market: 'JP' },
  { code: 'AAPL', name: 'Apple Inc.', market: 'US' },
  { code: 'GOOGL', name: 'Alphabet Inc.', market: 'US' },
  { code: 'MSFT', name: 'Microsoft Corp.', market: 'US' },
  { code: 'AMZN', name: 'Amazon.com Inc.', market: 'US' },
  { code: 'NVDA', name: 'NVIDIA Corp.', market: 'US' },
];

export const PortfolioInputPage = () => {
  const navigate = useNavigate();
  const {
    portfolio,
    period,
    isLoading,
    error,
    addStock,
    removeStock,
    updateWeight,
    setPeriod,
    setBacktestResult,
    setLoading,
    setError,
  } = usePortfolioStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>(SAMPLE_STOCKS);

  const totalWeight = portfolio.reduce((sum, item) => sum + item.weight, 0);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setSearchResults(SAMPLE_STOCKS);
      return;
    }
    try {
      const results = await searchStocks(query);
      setSearchResults(results.length > 0 ? results : SAMPLE_STOCKS.filter(
        s => s.code.toLowerCase().includes(query.toLowerCase()) ||
             s.name.toLowerCase().includes(query.toLowerCase())
      ));
    } catch {
      // APIエラー時はサンプルデータでフィルタリング
      setSearchResults(SAMPLE_STOCKS.filter(
        s => s.code.toLowerCase().includes(query.toLowerCase()) ||
             s.name.toLowerCase().includes(query.toLowerCase())
      ));
    }
  };

  const handleAddStock = (stock: Stock | null) => {
    if (stock && portfolio.length < 10) {
      addStock({ stock, weight: 0 });
      setSearchQuery('');
    }
  };

  const handleRunBacktest = async () => {
    if (portfolio.length === 0) {
      setError('銘柄を1つ以上選択してください');
      return;
    }
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError('投資比率の合計を100%にしてください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await runBacktest({ portfolio, period });
      setBacktestResult(result);
      navigate('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'バックテストに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          ポートフォリオ構築
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          銘柄を選択し、投資比率を設定してバックテストを実行します
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  銘柄を追加
                </Typography>
                <Autocomplete
                  options={searchResults}
                  getOptionLabel={(option) => `${option.code} - ${option.name}`}
                  value={null}
                  inputValue={searchQuery}
                  onInputChange={(_, value) => handleSearch(value)}
                  onChange={(_, value) => handleAddStock(value)}
                  disabled={portfolio.length >= 10}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="銘柄コードまたは名前で検索"
                      placeholder="例: 7203 または トヨタ"
                      fullWidth
                    />
                  )}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  最大10銘柄まで追加可能（{portfolio.length}/10）
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  バックテスト期間
                </Typography>
                <ToggleButtonGroup
                  value={period}
                  exclusive
                  onChange={(_, value) => value && setPeriod(value)}
                  fullWidth
                >
                  <ToggleButton value="1y">1年</ToggleButton>
                  <ToggleButton value="3y">3年</ToggleButton>
                  <ToggleButton value="5y">5年</ToggleButton>
                </ToggleButtonGroup>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    選択した銘柄
                  </Typography>
                  <Typography
                    variant="body2"
                    color={Math.abs(totalWeight - 100) < 0.01 ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    合計: {totalWeight.toFixed(1)}%
                  </Typography>
                </Box>

                {portfolio.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    銘柄が選択されていません
                  </Typography>
                ) : (
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {portfolio.map((item) => (
                      <Box
                        key={item.stock.code}
                        sx={{
                          p: 2,
                          mb: 2,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {item.stock.code}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.stock.name}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeStock(item.stock.code)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Slider
                            value={item.weight}
                            onChange={(_, value) => updateWeight(item.stock.code, value as number)}
                            min={0}
                            max={100}
                            sx={{ flex: 1 }}
                          />
                          <Typography sx={{ minWidth: 50, textAlign: 'right' }}>
                            {item.weight.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
            onClick={handleRunBacktest}
            disabled={isLoading || portfolio.length === 0}
            sx={{ px: 6, py: 1.5 }}
          >
            {isLoading ? 'バックテスト実行中...' : 'バックテスト実行'}
          </Button>
        </Box>
      </Box>
    </Layout>
  );
};
