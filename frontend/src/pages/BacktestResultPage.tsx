import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ArrowBack, TrendingUp, TrendingDown } from '@mui/icons-material';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { usePortfolioStore } from '../stores/portfolioStore';
import { Layout } from '../components/Layout';

export const BacktestResultPage = () => {
  const navigate = useNavigate();
  const { backtestResult, period } = usePortfolioStore();

  useEffect(() => {
    if (!backtestResult) {
      navigate('/');
    }
  }, [backtestResult, navigate]);

  if (!backtestResult) {
    return null;
  }

  const { dailyValues, metrics, benchmarkMetrics, portfolio } = backtestResult;

  const periodLabel = period === '1y' ? '1年' : period === '3y' ? '3年' : '5年';

  // チャート設定
  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 400,
      toolbar: { show: true },
      zoom: { enabled: true },
    },
    stroke: {
      curve: 'smooth',
      width: [3, 2],
    },
    colors: ['#1976d2', '#9e9e9e'],
    xaxis: {
      type: 'datetime',
      categories: dailyValues.map((d) => d.date),
      labels: {
        datetimeFormatter: {
          year: 'yyyy',
          month: "yyyy'/'MM",
          day: "MM'/'dd",
        },
      },
    },
    yaxis: {
      title: { text: 'ポートフォリオ価値' },
      labels: {
        formatter: (value) => value.toLocaleString(),
      },
    },
    legend: {
      position: 'top',
    },
    tooltip: {
      x: { format: 'yyyy/MM/dd' },
      y: {
        formatter: (value) => value.toLocaleString() + ' 円',
      },
    },
  };

  const chartSeries = [
    {
      name: 'ポートフォリオ',
      data: dailyValues.map((d) => d.value),
    },
    {
      name: 'ベンチマーク',
      data: dailyValues.map((d) => d.benchmark),
    },
  ];

  const MetricCard = ({
    label,
    value,
    suffix = '%',
    positive,
  }: {
    label: string;
    value: number;
    suffix?: string;
    positive?: boolean;
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {positive !== undefined && (
            positive ? (
              <TrendingUp color="success" />
            ) : (
              <TrendingDown color="error" />
            )
          )}
          <Typography variant="h4" fontWeight="bold">
            {value.toFixed(2)}{suffix}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/')}>
            戻る
          </Button>
          <Typography variant="h4" fontWeight="bold">
            バックテスト結果
          </Typography>
          <Chip label={periodLabel} color="primary" />
        </Box>

        {/* 主要指標 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard
              label="累積リターン"
              value={metrics.cumulativeReturn}
              positive={metrics.cumulativeReturn >= 0}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard
              label="年率リターン"
              value={metrics.annualizedReturn}
              positive={metrics.annualizedReturn >= 0}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard
              label="シャープレシオ"
              value={metrics.sharpeRatio}
              suffix=""
              positive={metrics.sharpeRatio >= 1}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard
              label="最大ドローダウン"
              value={metrics.maxDrawdown}
              positive={false}
            />
          </Grid>
        </Grid>

        {/* チャート */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ポートフォリオ価値推移
            </Typography>
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="line"
              height={400}
            />
          </CardContent>
        </Card>

        {/* ベンチマーク比較 */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ベンチマーク比較
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell align="right">累積リターン</TableCell>
                        <TableCell align="right">年率リターン</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>ポートフォリオ</TableCell>
                        <TableCell align="right" sx={{ color: metrics.cumulativeReturn >= 0 ? 'success.main' : 'error.main' }}>
                          {metrics.cumulativeReturn.toFixed(2)}%
                        </TableCell>
                        <TableCell align="right" sx={{ color: metrics.annualizedReturn >= 0 ? 'success.main' : 'error.main' }}>
                          {metrics.annualizedReturn.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ベンチマーク</TableCell>
                        <TableCell align="right" sx={{ color: benchmarkMetrics.cumulativeReturn >= 0 ? 'success.main' : 'error.main' }}>
                          {benchmarkMetrics.cumulativeReturn.toFixed(2)}%
                        </TableCell>
                        <TableCell align="right" sx={{ color: benchmarkMetrics.annualizedReturn >= 0 ? 'success.main' : 'error.main' }}>
                          {benchmarkMetrics.annualizedReturn.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ポートフォリオ構成
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>銘柄コード</TableCell>
                        <TableCell>銘柄名</TableCell>
                        <TableCell align="right">比率</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {portfolio.map((item) => (
                        <TableRow key={item.stock.code}>
                          <TableCell>{item.stock.code}</TableCell>
                          <TableCell>{item.stock.name}</TableCell>
                          <TableCell align="right">{item.weight.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
            sx={{ px: 6 }}
          >
            新しいバックテストを実行
          </Button>
        </Box>
      </Box>
    </Layout>
  );
};
