"""
Command Handlers for FinSight Chatbot
"""

from typing import Dict, Any, Optional
from .calculator import (
    calculate_depreciation,
    calculate_amortization,
    calculate_accrual,
    calculate_present_value,
    calculate_npv,
    calculate_irr,
    calculate_roi,
    calculate_ratio
)


class CommandHandler:
    """Handles all commands for the FinSight chatbot"""
    
    def __init__(self):
        self.commands = {
            "help": self.handle_help,
            "calculate": self.handle_calculate,
            "compliance": self.handle_compliance,
            "tax": self.handle_tax,
            "report": self.handle_report,
            "checklist": self.handle_checklist,
            "deadline": self.handle_deadline,
            "clear": self.handle_clear,
            "exit": self.handle_exit,
            "quit": self.handle_exit,
        }
    
    def get_help_text(self) -> str:
        """Return help text for all commands"""
        return """
   **FinSight Commands**

**Calculator:**
- `/calculate depreciation <cost> <life> [salvage] [method]` - Calculate depreciation
- `/calculate amortization <principal> <rate> <periods> [frequency]` - Loan amortization
- `/calculate accrual <amount> <rate> <days>` - Accrued interest
- `/calculate pv <future_value> <rate> <periods>` - Present value
- `/calculate npv <cash_flows> <rate>` - Net present value
- `/calculate irr <cash_flows>` - Internal rate of return
- `/calculate roi <investment> <final_value> [years]` - Return on investment
- `/calculate ratio <type> <values>` - Financial ratios

**Information:**
- `/compliance [standard]` - IFRS/GAAP compliance info
- `/tax [topic]` - Tax regulation queries
- `/report [type]` - Financial report templates
- `/checklist [type]` - Audit/compliance checklists
- `/deadline [country/topic]` - Filing deadlines

**Utility:**
- `/help` - Show this help message
- `/clear` - Clear conversation history

**Examples:**
```
/calculate depreciation 10000 5 1000
/calculate amortization 50000 0.05 60 monthly
/calculate roi 10000 15000 2
/compliance IFRS 16
/tax VAT
```
"""
    
    def handle_help(self, args: list) -> str:
        """Handle /help command"""
        return self.get_help_text()
    
    def handle_calculate(self, args: list) -> str:
        """Handle /calculate command"""
        if not args:
            return "Usage: `/calculate <type> <parameters>`\nType `/help` for details."
        
        calc_type = args[0].lower()
        
        try:
            if calc_type == "depreciation":
                return self._handle_depreciation(args[1:])
            elif calc_type == "amortization":
                return self._handle_amortization(args[1:])
            elif calc_type == "accrual":
                return self._handle_accrual(args[1:])
            elif calc_type == "pv":
                return self._handle_pv(args[1:])
            elif calc_type == "npv":
                return self._handle_npv(args[1:])
            elif calc_type == "irr":
                return self._handle_irr(args[1:])
            elif calc_type == "roi":
                return self._handle_roi(args[1:])
            elif calc_type == "ratio":
                return self._handle_ratio(args[1:])
            else:
                return f"Unknown calculation type: {calc_type}\nUse `/help` for available calculations."
        except Exception as e:
            return f"Error: {str(e)}"
    
    def _handle_depreciation(self, args: list) -> str:
        """Handle depreciation calculation"""
        if len(args) < 2:
            return "Usage: `/calculate depreciation <cost> <useful_life> [salvage_value] [method]`"
        
        cost = float(args[0])
        life = float(args[1])
        salvage = float(args[2]) if len(args) > 2 else 0
        method = args[3] if len(args) > 3 else "straight-line"
        
        result = calculate_depreciation(cost, life, salvage, method)
        
        if "error" in result:
            return result["error"]
        
        output = f" **Depreciation ({result['method']})**\n\n"
        output += f"Asset Cost: €{cost:,.2f}\n"
        output += f"Useful Life: {int(life)} years\n"
        output += f"Salvage Value: €{salvage:,.2f}\n"
        output += f"Annual Depreciation: €{result['annual_depreciation']:,.2f}\n\n"
        
        output += "**Schedule:**\n"
        for item in result["schedule"][:5]:
            output += f"  Year {item['year']}: €{item['expense']:,.2f} → Book Value: €{item['book_value']:,.2f}\n"
        
        if len(result["schedule"]) > 5:
            output += f"  ... ({len(result['schedule']) - 5} more years)"
        
        return output
    
    def _handle_amortization(self, args: list) -> str:
        """Handle amortization calculation"""
        if len(args) < 3:
            return "Usage: `/calculate amortization <principal> <rate> <periods> [frequency]`"
        
        principal = float(args[0])
        rate = float(args[1])
        periods = int(args[2])
        frequency = args[3] if len(args) > 3 else "monthly"
        
        result = calculate_amortization(principal, rate, periods, frequency)
        
        if "error" in result:
            return result["error"]
        
        output = f" **Amortization Schedule**\n\n"
        output += f"Principal: €{result['principal']:,.2f}\n"
        output += f"Interest Rate: {result['interest_rate']}\n"
        output += f"Periods: {periods} ({frequency})\n"
        output += f"Payment: €{result['payment']:,.2f}\n"
        output += f"Total Interest: €{result['total_interest']:,.2f}\n\n"
        
        output += "**First 5 Payments:**\n"
        for item in result["schedule"][:5]:
            output += f"  Period {item['period']}: Payment €{item['payment']:,.2f} "
            output += f"(Principal €{item['principal']:,.2f}, Interest €{item['interest']:,.2f})\n"
        
        output += f"\nRemaining: {len(result['schedule']) - 5} more payments"
        
        return output
    
    def _handle_accrual(self, args: list) -> str:
        """Handle accrual calculation"""
        if len(args) < 3:
            return "Usage: `/calculate accrual <amount> <rate> <days>`"
        
        amount = float(args[0])
        rate = float(args[1])
        days = int(args[2])
        
        result = calculate_accrual(amount, rate, days)
        
        output = f" **Accrued Interest**\n\n"
        output += f"Principal: €{result['principal']:,.2f}\n"
        output += f"Rate: {result['rate']}\n"
        output += f"Days: {result['days']}\n"
        output += f"Accrued Interest: €{result['accrued_interest']:,.2f}\n\n"
        output += f"Formula: {result['formula']}"
        
        return output
    
    def _handle_pv(self, args: list) -> str:
        """Handle present value calculation"""
        if len(args) < 3:
            return "Usage: `/calculate pv <future_value> <rate> <periods> [frequency]`"
        
        fv = float(args[0])
        rate = float(args[1])
        periods = int(args[2])
        frequency = args[3] if len(args) > 3 else "annually"
        
        result = calculate_present_value(fv, rate, periods, frequency)
        
        output = f" **Present Value**\n\n"
        output += f"Future Value: €{result['future_value']:,.2f}\n"
        output += f"Discount Rate: {result['discount_rate']}\n"
        output += f"Periods: {result['periods']} ({result['frequency']})\n"
        output += f"Present Value: €{result['present_value']:,.2f}\n"
        output += f"Discount: €{result['discount']:,.2f}"
        
        return output
    
    def _handle_npv(self, args: list) -> str:
        """Handle NPV calculation"""
        if len(args) < 3:
            return "Usage: `/calculate npv <cash_flows> <rate>`"
        
        rate = float(args[-1])
        cash_flows = [float(x) for x in args[:-1]]
        
        result = calculate_npv(cash_flows, rate)
        
        output = f" **Net Present Value**\n\n"
        output += f"Cash Flows: {cash_flows}\n"
        output += f"Discount Rate: {result['discount_rate']}\n"
        output += f"**NPV: €{result['npv']:,.2f}**\n"
        output += f"Decision: {result['decision']}\n\n"
        
        output += "**Year-by-Year:**\n"
        for item in result["details"]:
            output += f"  Year {item['year']}: CF €{item['cash_flow']:,.2f} → PV €{item['present_value']:,.2f}\n"
        
        return output
    
    def _handle_irr(self, args: list) -> str:
        """Handle IRR calculation"""
        if len(args) < 2:
            return "Usage: `/calculate irr <cash_flows>`\nExample: `/calculate irr -1000 300 400 500 600`"
        
        cash_flows = [float(x) for x in args]
        result = calculate_irr(cash_flows)
        
        output = f" **Internal Rate of Return**\n\n"
        output += f"Cash Flows: {result['cash_flows']}\n"
        output += f"**IRR: {result['irr']}**\n"
        if "npv_at_irr" in result:
            output += f"NPV at IRR: €{result['npv_at_irr']:,.2f}\n"
        output += f"Decision: {result['decision']}"
        
        return output
    
    def _handle_roi(self, args: list) -> str:
        """Handle ROI calculation"""
        if len(args) < 2:
            return "Usage: `/calculate roi <initial_investment> <final_value> [holding_period]`"
        
        investment = float(args[0])
        final = float(args[1])
        years = float(args[2]) if len(args) > 2 else 1
        
        result = calculate_roi(investment, final, years)
        
        output = f" **Return on Investment**\n\n"
        output += f"Initial Investment: €{result['initial_investment']:,.2f}\n"
        output += f"Final Value: €{result['final_value']:,.2f}\n"
        output += f"Holding Period: {result['holding_period']}\n"
        output += f"**Total Return: €{result['total_return']:,.2f}**\n"
        output += f"**ROI: {result['roi']}**\n"
        output += f"**Annualized ROI: {result['annualized_roi']}**"
        
        return output
    
    def _handle_ratio(self, args: list) -> str:
        """Handle ratio calculation"""
        if len(args) < 1:
            return "Usage: `/calculate ratio <type>`\n\nTypes: current, quick, debt_to_equity, gross_margin, net_margin, roe, roa"
        
        ratio_type = args[0].lower()
        
        # For demo, show required values
        required = {
            "current": "current_assets, current_liabilities",
            "quick": "current_assets, inventory, current_liabilities",
            "debt_to_equity": "total_liabilities, total_equity",
            "gross_margin": "revenue, cogs",
            "net_margin": "revenue, net_income",
            "roe": "net_income, total_equity",
            "roa": "net_income, total_assets"
        }
        
        if ratio_type not in required:
            return f"Unknown ratio type. Available: {', '.join(required.keys())}"
        
        return f" **{ratio_type.replace('_', ' ').title()} Ratio**\n\n" \
               f"Formula: {_get_ratio_formula(ratio_type)}\n\n" \
               f"To calculate, provide values:\n" \
               f"`/calculate ratio {ratio_type} {required[ratio_type]}`\n\n" \
               f"Example for current ratio:\n" \
               f"`/calculate ratio current 100000 50000`"
    
    def handle_compliance(self, args: list) -> str:
        """Handle /compliance command"""
        if not args:
            return """
 **IFRS/GAAP Compliance Information**

**Available Topics:**
- IFRS 1 - First-time Adoption
- IFRS 15 - Revenue from Contracts
- IFRS 16 - Leases
- IFRS 9 - Financial Instruments
- IFRS 16 - Provisions
- IAS 1 - Presentation of Financial Statements
- IAS 16 - Property, Plant & Equipment
- IAS 36 - Impairment
- US GAAP - Overview

**Usage:** `/compliance <standard>`

**Examples:**
```
/compliance IFRS 16
/compliance IFRS 15
/compliance GAAP
```
"""
        
        topic = " ".join(args).upper()
        
        compliance_info = {
            "IFRS 16": """
 **IFRS 16 - Leases**

**Key Changes (effective Jan 2019):**
- Lessees must recognize lease liabilities and right-of-use assets
- Operating leases → On-balance sheet treatment
- Finance leases → Similar to previous treatment

**Recognition Criteria:**
- Lease term > 12 months, OR
- Lease payments < substantially all of asset's fair value

**Measurement:**
- Lease liability: Present value of lease payments
- ROU asset: Lease liability + initial costs + restoration costs

**Disclosure Requirements:**
- Reconciliation of lease commitments
- Maturity analysis of lease liabilities
- Interest expense on leases
""",
            "IFRS 15": """
 **IFRS 15 - Revenue from Contracts**

**5-Step Model:**
1. Identify contract(s) with customer
2. Identify performance obligations
3. Determine transaction price
4. Allocate price to performance obligations
5. Recognize revenue when performance satisfied

**Key Principles:**
- Revenue recognized when control transfers
- Variable consideration estimated using expected value
- Incremental costs of obtaining contract capitalized
""",
            "IFRS 9": """
 **IFRS 9 - Financial Instruments**

**3 main areas:**
1. Classification & Measurement
2. Impairment (expected credit losses)
3. Hedge Accounting

**Classification:**
- Amortized cost (business model: hold)
- FVOCI (business model: hold & sell)
- FVTPL (other)

**Impairment:**
- 3-stage model (12-month vs lifetime ECL)
- Simplified approach for trade receivables
""",
            "GAAP": """
 **US GAAP Overview**

**Key Differences from IFRS:**

| Area | US GAAP | IFRS |
|------|---------|------|
| Inventory LIFO | LIFO allowed | LIFO prohibited |
| Development costs | Usually expensed | Capitalize if criteria met |
| Lease classification | Different thresholds | More principles-based |
| Revaluation model | Not allowed | Allowed for PPE |
| Impairment | Impairment loss recognized | Reversals allowed |

**Financial Statement Order:**
- Balance Sheet: Assets → Liabilities → Equity
- P&L: Multiple formats allowed
"""
        }
        
        for key in compliance_info:
            if key.replace("IFRS ", "").replace("GAAP", "") in topic.replace("IFRS ", "").replace("GAAP", ""):
                return compliance_info[key]
        
        return f"Topic '{topic}' not found. Use `/compliance` for available topics."
    
    def handle_tax(self, args: list) -> str:
        """Handle /tax command"""
        if not args:
            return """
 **Tax Information**

**Available Topics:**
- VAT - Value Added Tax
- Corporate Tax - Corporate income tax
- Transfer Pricing - Intercompany pricing
- Withholding Tax - Cross-border payments
- Tax Deadlines - Filing dates

**Usage:** `/tax <topic>`

**Examples:**
```
/tax VAT
/tax corporate
/tax transfer
```
"""
        
        topic = " ".join(args).lower()
        
        tax_info = {
            "vat": """
 **VAT (Value Added Tax)**

**EU VAT Rates:**
| Country | Standard Rate |
|---------|---------------|
| Germany | 19% |
| France | 20% |
| Netherlands | 21% |
| UK | 20% |
| Spain | 21% |

**VAT Types:**
- Standard: Normal goods/services
- Reduced: Food, books, transport (typically 5-10%)
- Zero: Essential items, exports

**Key Dates:**
- Monthly: 20th of following month
- Quarterly: 20th after quarter end
- Annual: 31 March (UK), varies by country
""",
            "corporate": """
 **Corporate Tax**

**EU Corporate Tax Rates 2024:**
| Country | Rate |
|---------|------|
| Ireland | 12.5% |
| Netherlands | 25.8% |
| Germany | 30% |
| France | 25% |
| Belgium | 25% |

**Key Deductions:**
- R&D credits
- Interest expense (ATAD limits)
- Loss carry-forward
- Depreciation

**Transfer Pricing:**
- Arm's length principle required
- Documentation mandatory in most EU countries
- Country-by-country reporting for large groups
""",
            "transfer": """
 **Transfer Pricing**

**Arm's Length Principle:**
Transactions between related parties must be at prices that would be charged between independent parties.

**Methods (OECD):**
1. Comparable Uncontrolled Price (CUP)
2. Resale Price Method
3. Cost Plus Method
4. Transactional Net Margin Method (TNMM)
5. Profit Split Method

**Documentation (EU):**
- Master File: Group overview
- Local File: Specific transactions
- CbCR: Country-by-country reporting

**Safe Harbors:**
- Low value-adding services (< €1M)
- Certain loans (< €1M)
"""
        }
        
        for key in tax_info:
            if key in topic:
                return tax_info[key]
        
        return f"Topic not found. Use `/tax` for available topics."
    
    def handle_report(self, args: list) -> str:
        """Handle /report command"""
        return """
 **Financial Report Templates**

**Available Templates:**
- Balance Sheet
- Income Statement (P&L)
- Cash Flow Statement
- Statement of Changes in Equity

**Usage:** `/report <type>`

**Examples:**
```
/report balance
/report pnl
/report cashflow
```

**Key Components:**

**Balance Sheet:**
- Assets (Current/Non-current)
- Liabilities (Current/Non-current)
- Equity

**Income Statement:**
- Revenue
- Cost of Goods Sold
- Gross Profit
- Operating Expenses
- Net Income

**Cash Flow:**
- Operating Activities
- Investing Activities
- Financing Activities
"""
    
    def handle_checklist(self, args: list) -> str:
        """Handle /checklist command"""
        return """
 **Audit & Compliance Checklists**

**Available Checklists:**
- Audit Preparation
- Year-End Close
- IFRS Compliance
- Internal Controls

**Usage:** `/checklist <type>`

**Examples:**
```
/checklist audit
/checklist yearend
/checklist ifrs
```

**Audit Prep Checklist:**
□ Gather all supporting documentation
□ Verify reconciliations complete
□ Review accruals and prepayments
□ Confirm intercompany balances
□ Test controls effectiveness
□ Prepare working papers

**Year-End Close:**
□ Cut-off procedures reviewed
□ Accruals properly recorded
□ Fixed assets depreciation updated
□ Inventory counted and valued
□ Bank reconciliations complete
□ Tax provisions calculated
"""
    
    def handle_deadline(self, args: list) -> str:
        """Handle /deadline command"""
        return """
 **Key Filing Deadlines**

**Corporate Tax (EU):**
| Country | Deadline |
|---------|----------|
| UK | 31 March (online) |
| Germany | 31 July |
| France | 15 May |
| Netherlands | First 5 months |

**VAT:**
- Monthly: 20th of following month
- Quarterly: 20th after quarter end
- Annual: Varies by country

**Statutory Accounts:**
- UK: 9 months after year-end
- Germany: 11 months after year-end
- France: 5 months after year-end

**Audit Filing:**
- Public interest entities: 4 months
- Private companies: Varies by size

**Use `/deadline <country>` for specific dates**
"""
    
    def handle_clear(self, args: list) -> str:
        """Handle /clear command"""
        return "Conversation history cleared. How can I help you?"
    
    def handle_exit(self, args: list) -> str:
        """Handle /exit command"""
        return "__EXIT__"
    
    def process_command(self, user_input: str) -> str:
        """Process user input and return response"""
        parts = user_input.strip().split()
        
        if not parts:
            return "Please enter a command. Type `/help` for available commands."
        
        command = parts[0].lower()
        args = parts[1:]
        
        if command.startswith("/"):
            command = command[1:]
        
        if command in self.commands:
            return self.commands[command](args)
        
        return f"Unknown command: /{command}\nType `/help` for available commands."