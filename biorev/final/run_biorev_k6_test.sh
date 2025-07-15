#!/bin/bash

# Simple K6 Performance Test Runner
# =================================
# This script runs the modular performance test workflow

echo "🚀 K6 Performance Test - Modular Workflow"
echo "=========================================="

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: Run K6 test
print_info "Step 1: Running K6 performance test..."
if command -v k6 &> /dev/null; then
    k6 run biorev_k6_csv_test.js
    if [ $? -eq 0 ] && [ -f "k6_metrics_summary.csv" ]; then
        print_status "K6 test completed - CSV metrics generated"
    else
        print_error "K6 test failed or CSV not generated"
        exit 1
    fi
else
    print_error "K6 not installed. Please install from: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

echo ""

# Step 2: Generate visualizations
print_info "Step 2: Generating visualizations and baseline comparison..."
if command -v python3 &> /dev/null; then
    python3 generate_visualizations.py
    if [ $? -eq 0 ]; then
        print_status "Visualizations generated successfully"
    else
        print_error "Visualization generation failed"
        exit 1
    fi
else
    print_error "Python3 not installed"
    exit 1
fi

echo ""
print_status "🎉 Performance test workflow completed!"

echo ""
echo "📁 Generated Files:"
echo "• k6_metrics_summary.csv - K6 performance metrics"
echo "• k6_timeseries_data.csv - Time series data for analysis"
echo "• single_user_baseline.csv - Single user baseline comparison"
echo "• k6_performance_visualizations.png - 8 comprehensive charts"
