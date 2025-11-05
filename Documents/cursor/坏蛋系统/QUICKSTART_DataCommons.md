# Data Commons MCP Server - Quick Start Guide

## 🚀 Quick Setup for Bad Egg System

### 1. Install Dependencies
```bash
cd /Users/zhimingdeng/Documents/cursor/坏蛋系统
./setup_datacommons.sh
```

### 2. Test Installation
```bash
python3 test_datacommons_integration.py
```

### 3. Run Demo
```bash
python3 bad_egg_datacommons_integration.py
```

### 4. Configure Claude Code
Add to your Claude Code settings:
```json
{
  "mcpServers": {
    "datacommons": {
      "command": "python",
      "args": ["/Users/zhimingdeng/Documents/cursor/坏蛋系统/datacommons_mcp_server.py"]
    }
  }
}
```

## 🎯 What You Can Do Now

### Validate Transactions
```python
result = await integration.validate_transaction_amount(TransactionProfile(
    amount=500.00,
    currency="USD",
    country="USA",
    user_demographics={"age": 30},
    transaction_type="online_purchase",
    timestamp=datetime.now()
))
```

### Assess Fraud Risk
```python
risk_profile = await integration.assess_fraud_risk(transaction)
print(f"Risk Score: {risk_profile.overall_risk_score}")
```

### Get Market Insights
```python
insights = await integration.generate_payment_insights("USA")
print(f"Market Readiness: {insights['payment_ecosystem']['readiness_score']}")
```

## 📊 Available Data

- **Economic**: GDP, income, unemployment, inflation
- **Demographic**: Population, age, education, income distribution
- **Geographic**: Country, state, city statistics
- **Business**: Banking density, internet penetration
- **Risk**: Economic stability, fraud indicators

## 🔑 API Key (Optional)

Get a free API key from https://datacommons.org/api for higher limits:
```bash
# Add to .env file
DATACOMMONS_API_KEY=your-key-here
```

## 📖 Documentation

- Full documentation: `README_DataCommons_MCP.md`
- API reference: https://docs.datacommons.org/api/
- Statistical variables: https://docs.datacommons.org/statistics/

## 🆘 Support

- Check logs in `logs/` directory
- Run tests: `python3 test_datacommons_integration.py`
- Review sample usage in `bad_egg_datacommons_integration.py`