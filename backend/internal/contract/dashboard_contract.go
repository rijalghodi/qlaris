package contract

// Comparison represents percentage changes
type ComparisonRes struct {
	SalesPercent        float64 `json:"salesPercent"`
	TransactionsPercent float64 `json:"transactionsPercent"`
	ProfitPercent       float64 `json:"profitPercent"`
}

// DayStatsRes represents daily statistics
type DayStatsRes struct {
	Sales            float64        `json:"sales"`
	Transactions     int64          `json:"transactions"`
	Profit           float64        `json:"profit"`
	CompareYesterday *ComparisonRes `json:"compareYesterday,omitempty"`
}

// WeekStatsRes represents weekly statistics
type WeekStatsRes struct {
	Sales           float64        `json:"sales"`
	Transactions    int64          `json:"transactions"`
	Profit          float64        `json:"profit"`
	CompareLastWeek *ComparisonRes `json:"compareLastWeek,omitempty"`
}

// DashboardSummaryRes is the main dashboard response
type DashboardSummaryRes struct {
	Today            DayStatsRes      `json:"today"`
	ThisWeek         WeekStatsRes     `json:"thisWeek"`
	LastTransactions []TransactionRes `json:"lastTransactions"`
	TopProducts      []ProductRes     `json:"topProducts"`
}
