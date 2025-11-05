# Installation and Setup Guide

## 📦 System Requirements

### Compatible Platforms
- Claude.ai (web interface)
- Claude Code
- Claude Agent SDK
- Claude Developer Platform

### Prerequisites
- Access to Claude agents
- Basic understanding of payment platforms
- Web search capabilities (recommended)

## 🚀 Installation Steps

### Step 1: Download Skill Files
```bash
# Create skills directory (if not exists)
mkdir -p ~/.claude/skills/

# Copy skill files
cp -r payment-platform-validator ~/.claude/skills/
```

### Step 2: Verify Skill Structure
```bash
# Ensure all required files are present
ls -la ~/.claude/skills/payment-platform-validator/
# Expected output:
# SKILL.md
# platform-reference.md
# validation-checklist.md
# tools-and-commands.md
# README.md
# install.md
```

### Step 3: Load Skill in Claude
```
User prompt: "Load the Payment Platform Validator skill from ~/.claude/skills/payment-platform-validator/"
```

## ⚙️ Configuration

### Environment Variables (Optional)
```bash
# Search API keys (if using external search services)
export EXA_API_KEY="your_exa_api_key"
export PERPLEXICA_API_KEY="your_perplexica_key"

# Default validation parameters
export VALIDATION_TIMEOUT="30"  # minutes
export SUCCESS_THRESHOLD="80"   # percentage
```

### Claude Agent Configuration
```yaml
# claude_config.yaml
skills:
  - path: ~/.claude/skills/payment-platform-validator/
    auto_load: true
    priority: high

validation_parameters:
  default_market: "US"
  assume_ach_for_us: true
  require_multi_scenario: true
```

## 🎯 Quick Validation

### Test the Skill
```
User prompt: "Using the Payment Platform Validator skill, quickly validate if Stripe is suitable for personal users to receive ACH payments."
```

Expected response should include:
- Application of US Market Logic
- Reference to Stripe Connect capabilities
- Validation result with confidence score

## 📚 Usage Examples

### Basic Platform Validation
```
User: "Can I use Gumroad to receive payments as an individual creator and transfer to my bank account?"

Expected skill application:
1. Load skill knowledge about Gumroad
2. Apply 5-point validation framework
3. Reference similar validated platforms
4. Provide confident recommendation
```

### Advanced Platform Analysis
```
User: "Analyze [New Platform] for personal payment collection capabilities using the Payment Platform Validator framework."

Expected skill application:
1. Execute validation checklist
2. Compare against success patterns
3. Apply US Market Logic
4. Provide detailed assessment with scoring
```

## 🔧 Tool Integration

### Recommended Tools
- Web search (for platform discovery)
- Browser automation (for technical verification)
- Document analysis (for terms and conditions)

### Tool Configuration
```bash
# Enable recommended MCP tools
mcp__perplexica__search_web
mcp__exa-cloud__web_search_exa
mcp__fetch__search_duckduckgo
mcp__playwright__browser_*
```

## 📊 Performance Monitoring

### Success Tracking
```bash
# Create validation log
touch ~/.claude/skills/payment-platform-validator/validation_log.csv

# Track validation results
echo "date,platform,result,score" > ~/.claude/skills/payment-platform-validator/validation_log.csv
```

### Quality Metrics
- Validation accuracy: Maintain 100% success rate
- Validation speed: Target <30 minutes per platform
- User satisfaction: Monitor feedback and adjust

## 🔄 Updates and Maintenance

### Updating the Skill
```bash
# Download latest version
cd ~/.claude/skills/
git pull origin main

# Or manually replace files
cp -r /path/to/new/payment-platform-validator/ .
```

### Adding New Platform Data
1. Validate new platforms using the framework
2. Update `platform-reference.md` with findings
3. Adjust `validation-checklist.md` if new patterns emerge
4. Update success rate metrics

## 🆘 Troubleshooting

### Common Issues

**Skill not loading**
```bash
# Check file permissions
chmod -R 644 ~/.claude/skills/payment-platform-validator/

# Verify YAML syntax in SKILL.md
python -c "import yaml; yaml.safe_load(open('SKILL.md'))"
```

**Validation inconsistencies**
```bash
# Review validation checklist
cat ~/.claude/skills/payment-platform-validator/validation-checklist.md

# Check platform reference for similar cases
grep -i "similar" ~/.claude/skills/payment-platform-validator/platform-reference.md
```

**Tool integration problems**
```bash
# Verify MCP server status
echo "Testing MCP tools..."

# Check browser automation
mcp__playwright__browser_navigate "https://example.com"
```

## 📞 Support

### Getting Help
1. Review `README.md` for usage guidance
2. Check `validation-checklist.md` for framework details
3. Reference `platform-reference.md` for success patterns
4. Use `tools-and-commands.md` for technical assistance

### Contributing
To improve this skill:
1. Document new validation successes/failures
2. Refine validation criteria based on experience
3. Update success patterns and insights
4. Share findings with the community

---

**Version**: 1.0
**Based on**: 14 platform validations (100% success rate)
**Last Updated**: 2025-10-26