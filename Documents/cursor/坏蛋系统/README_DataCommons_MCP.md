# Data Commons MCP Server for Bad Egg System

This custom MCP server integrates Google's Data Commons with your Bad Egg System, providing access to thousands of statistical datasets for payment platform validation, fraud detection, and financial analysis.

## Overview

Data Commons is a Google-led initiative that aggregates data from public sources like government agencies, international organizations, and research institutions into a unified knowledge graph. This MCP server makes that data accessible through the Model Context Protocol.

## Available Data Categories

### 1. Economic Indicators
- **GDP and GDP per capita** - Economic strength assessment
- **Unemployment rates** - Regional economic health
- **Poverty rates** - Socioeconomic risk factors
- **Median income levels** - Customer profiling
- **Inflation rates** - Economic volatility indicators

### 2. Demographic Data
- **Population statistics** - Market sizing and validation
- **Age distributions** - Target audience analysis
- **Education levels** - Fraud risk assessment
- **Household income** - Payment capacity validation
- **Population density** - Geographic risk modeling

### 3. Business & Financial Data
- **Bank locations and density** - Banking infrastructure assessment
- **Business establishments** - Economic activity validation
- **Internet penetration** - Digital payment adoption rates
- **Migration patterns** - Population mobility indicators

### 4. Geographic Data
- **Country, state, and city statistics**
- **Regional economic indicators**
- **Cross-border data for international payments**

## Installation

### 1. Install Dependencies
```bash
cd /Users/zhimingdeng/Documents/cursor/坏蛋系统
pip install -r requirements.txt
```

### 2. Set up API Key (Optional)
Get a Data Commons API key from https://datacommons.org/api and add it to your environment:
```bash
export DATACOMMONS_API_KEY="your-api-key-here"
```

### 3. Configure MCP Server
The MCP server is already configured in `/Users/zhimingdeng/Documents/cursor/坏蛋系统/mcp-config.json`. Make sure your Claude Code configuration includes this server.

## Usage Examples

### Basic Economic Data Query
```python
# Get economic indicators for a country
result = await handler.handle_get_economic_data({"country": "country/USA"})
```

### Demographic Analysis
```python
# Get demographic data for risk assessment
result = await handler.handle_get_demographic_data({"place": "geoId/06"})  # California
```

### Fraud Detection Data
```python
# Get fraud-relevant indicators
result = await handler.handle_get_fraud_data({"place": "country/GBR"})
```

### Place Search
```python
# Find places by name
result = await handler.handle_search_places({"query": "New York", "place_type": "State"})
```

### Custom Statistical Queries
```python
# Query any statistical variable
result = await handler.handle_get_statistical_data({
    "place": "country/USA",
    "statistical_variable": "Count_Person"
})
```

## Integration with Bad Egg System

### 1. Payment Validation
Use demographic and economic data to validate:
- Transaction amounts against regional income levels
- Geographic patterns for suspicious activities
- Economic indicators for transaction volume validation

### 2. Fraud Detection
Leverage risk indicators:
- Internet penetration rates for digital fraud patterns
- Population mobility for account takeover risks
- Banking infrastructure for payment method validation

### 3. Risk Assessment
Combine multiple data points:
- Economic stability indicators for default risk
- Demographic factors for payment method preferences
- Geographic data for cross-border transaction risks

## Available Statistical Variables

Key variables for payment platform use:

### Economic Variables
- `Count_EconomicActivity_GrossDomesticProduction_Nominal`
- `Count_EconomicActivity_GrossDomesticProduction_Nominal_PerCapita`
- `Median_Income_Person`
- `Median_Income_Household`
- `Count_Person_PovertyStatus_BelowPovertyLine`

### Demographic Variables
- `Count_Person`
- `Median_Age_Person`
- `Count_Person_PerArea`
- `Count_Person_EducationalAttainment`

### Business Variables
- `Count_Organization_Bank`
- `Count_Organization_InternetAccessProvider`
- `Count_EconomicActivity_Bankruptcy`

## Data Sources

Data Commons aggregates from:
- World Bank
- International Monetary Fund (IMF)
- United Nations
- National statistical agencies
- Census bureaus
- Central banks
- Economic research organizations

## API Limits

- **Free tier**: Limited requests per day
- **Authentication**: API key required for production use
- **Rate limiting**: Apply based on your subscription level
- **Data freshness**: Varies by source (typically updated annually)

## Configuration Options

### Environment Variables
- `DATACOMMONS_API_KEY`: Your API key for production use
- `DATACOMMONS_BASE_URL`: Custom API endpoint (default: https://api.datacommons.org/v2)

### MCP Configuration
```json
{
  "mcpServers": {
    "datacommons": {
      "command": "python",
      "args": ["/path/to/datacommons_mcp_server.py"],
      "env": {
        "DATACOMMONS_API_KEY": "your-key-here"
      }
    }
  }
}
```

## Error Handling

The server provides comprehensive error responses:
```json
{
  "success": false,
  "error": "Error message",
  "source": "python_client|rest_api|error"
}
```

## Testing

Run the built-in test suite:
```bash
python datacommons_mcp_server.py
```

This will demonstrate:
- Economic indicator retrieval
- Demographic data access
- Fraud detection indicators
- Place search functionality

## Support and Documentation

- **Data Commons Documentation**: https://docs.datacommons.org
- **API Reference**: https://docs.datacommons.org/api/
- **Statistical Variables**: https://docs.datacommons.org/statistics/
- **MCP Protocol**: https://modelcontextprotocol.io

## License

This MCP server implementation follows the same Apache 2.0 license as Data Commons.

## Contributing

To extend this server:
1. Add new statistical variables to the relevant functions
2. Implement additional data sources or APIs
3. Create specialized handlers for specific use cases
4. Add caching mechanisms for improved performance