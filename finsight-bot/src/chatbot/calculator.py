"""
Financial Calculator Module for FinSight
Provides various financial calculation functions
"""

from typing import Optional, Tuple
import math


def calculate_depreciation(
    cost: float,
    useful_life: float,
    salvage_value: float = 0,
    method: str = "straight-line"
) -> dict:
    """
    Calculate depreciation using various methods
    
    Args:
        cost: Asset cost
        useful_life: Useful life in years
        salvage_value: Residual value at end of life
        method: 'straight-line', 'declining-balance', 'sum-of-years'
    
    Returns:
        Dictionary with depreciation schedule
    """
    depreciable_amount = cost - salvage_value
    
    if method == "straight-line":
        annual_depreciation = depreciable_amount / useful_life
        schedule = []
        book_value = cost
        for year in range(1, int(useful_life) + 1):
            book_value -= annual_depreciation
            schedule.append({
                "year": year,
                "expense": round(annual_depreciation, 2),
                "book_value": round(max(book_value, salvage_value), 2)
            })
        return {
            "method": "Straight-Line",
            "annual_depreciation": round(annual_depreciation, 2),
            "total_depreciation": round(depreciable_amount, 2),
            "schedule": schedule
        }
    
    elif method == "declining-balance":
        rate = 2 / useful_life  # Double declining balance
        schedule = []
        book_value = cost
        for year in range(1, int(useful_life) + 1):
            expense = book_value * rate
            if book_value - expense < salvage_value:
                expense = book_value - salvage_value
            book_value -= expense
            schedule.append({
                "year": year,
                "expense": round(expense, 2),
                "book_value": round(book_value, 2)
            })
        return {
            "method": "Declining Balance",
            "rate": f"{rate*100}%",
            "schedule": schedule
        }
    
    elif method == "sum-of-years":
        sum_of_years = useful_life * (useful_life + 1) / 2
        schedule = []
        book_value = cost
        remaining_life = useful_life
        for year in range(1, int(useful_life) + 1):
            expense = (remaining_life / sum_of_years) * depreciable_amount
            book_value -= expense
            remaining_life -= 1
            schedule.append({
                "year": year,
                "expense": round(expense, 2),
                "book_value": round(book_value, 2)
            })
        return {
            "method": "Sum-of-Years Digits",
            "sum_of_years": sum_of_years,
            "schedule": schedule
        }
    
    return {"error": "Invalid method. Use: straight-line, declining-balance, or sum-of-years"}


def calculate_amortization(
    principal: float,
    rate: float,
    periods: int,
    payment_frequency: str = "monthly"
) -> dict:
    """
    Calculate loan amortization
    
    Args:
        principal: Loan amount
        rate: Annual interest rate (as decimal, e.g., 0.05 for 5%)
        periods: Number of payment periods
        payment_frequency: 'monthly', 'quarterly', 'annually'
    
    Returns:
        Amortization schedule
    """
    frequency_map = {"monthly": 12, "quarterly": 4, "annually": 1}
    periods_per_year = frequency_map.get(payment_frequency, 12)
    periods_rate = rate / periods_per_year
    
    # Calculate payment using annuity formula
    if periods_rate > 0:
        payment = principal * (periods_rate * (1 + periods_rate) ** periods) / ((1 + periods_rate) ** periods - 1)
    else:
        payment = principal / periods
    
    schedule = []
    balance = principal
    total_interest = 0
    
    for period in range(1, periods + 1):
        interest_payment = balance * periods_rate
        principal_payment = payment - interest_payment
        balance -= principal_payment
        total_interest += interest_payment
        
        schedule.append({
            "period": period,
            "payment": round(payment, 2),
            "principal": round(principal_payment, 2),
            "interest": round(interest_payment, 2),
            "balance": round(max(balance, 0), 2)
        })
    
    return {
        "principal": principal,
        "interest_rate": f"{rate*100}%",
        "payment": round(payment, 2),
        "total_payment": round(payment * periods, 2),
        "total_interest": round(total_interest, 2),
        "schedule": schedule
    }


def calculate_accrual(
    amount: float,
    rate: float,
    days: int
) -> dict:
    """
    Calculate accrued interest
    
    Args:
        amount: Principal amount
        rate: Annual interest rate (as decimal)
        days: Number of days
    
    Returns:
        Accrued interest calculation
    """
    days_in_year = 365
    accrued_interest = amount * rate * days / days_in_year
    
    return {
        "principal": amount,
        "rate": f"{rate*100}%",
        "days": days,
        "accrued_interest": round(accrued_interest, 2),
        "formula": f"{amount} × {rate} × {days} / 365"
    }


def calculate_present_value(
    future_value: float,
    rate: float,
    periods: int,
    payment_frequency: str = "annually"
) -> dict:
    """
    Calculate present value
    
    Args:
        future_value: Future cash flow
        rate: Discount rate (as decimal)
        periods: Number of periods
        payment_frequency: 'monthly', 'quarterly', 'annually'
    
    Returns:
        Present value calculation
    """
    frequency_map = {"monthly": 12, "quarterly": 4, "annually": 1}
    periods_per_year = frequency_map.get(payment_frequency, 1)
    adjusted_rate = rate / periods_per_year
    adjusted_periods = periods * periods_per_year
    
    pv = future_value / ((1 + adjusted_rate) ** adjusted_periods)
    
    return {
        "future_value": future_value,
        "discount_rate": f"{rate*100}%",
        "periods": periods,
        "frequency": payment_frequency,
        "present_value": round(pv, 2),
        "discount": round(future_value - pv, 2)
    }


def calculate_npv(
    cash_flows: list,
    rate: float
) -> dict:
    """
    Calculate Net Present Value
    
    Args:
        cash_flows: List of cash flows (first is investment, negative)
        rate: Discount rate (as decimal)
    
    Returns:
        NPV calculation
    """
    npv = 0
    details = []
    
    for i, cf in enumerate(cash_flows):
        pv = cf / ((1 + rate) ** i)
        npv += pv
        details.append({
            "year": i,
            "cash_flow": cf,
            "present_value": round(pv, 2)
        })
    
    return {
        "cash_flows": cash_flows,
        "discount_rate": f"{rate*100}%",
        "npv": round(npv, 2),
        "details": details,
        "decision": "Accept" if npv > 0 else "Reject"
    }


def calculate_irr(
    cash_flows: list,
    max_iterations: int = 1000,
    tolerance: float = 0.0001
) -> dict:
    """
    Calculate Internal Rate of Return using Newton-Raphson method
    
    Args:
        cash_flows: List of cash flows
        max_iterations: Maximum iterations
        tolerance: Convergence tolerance
    
    Returns:
        IRR calculation
    """
    # Initial guess
    rate = 0.1
    
    for i in range(max_iterations):
        npv = 0
        derivative = 0
        
        for j, cf in enumerate(cash_flows):
            npv += cf / ((1 + rate) ** j)
            if j > 0:
                derivative -= j * cf / ((1 + rate) ** (j + 1))
        
        if abs(npv) < tolerance:
            return {
                "cash_flows": cash_flows,
                "irr": f"{rate * 100:.2f}%",
                "npv_at_irr": round(npv, 2),
                "iterations": i + 1,
                "decision": "Accept" if rate > 0 else "Reject"
            }
        
        if derivative == 0:
            break
        
        rate = rate - npv / derivative
    
    return {
        "cash_flows": cash_flows,
        "irr": f"{rate * 100:.2f}%",
        "note": "Approximation - may not have converged"
    }


def calculate_roi(
    initial_investment: float,
    final_value: float,
    holding_period: float = 1
) -> dict:
    """
    Calculate Return on Investment
    
    Args:
        initial_investment: Starting investment
        final_value: Ending value
        holding_period: Holding period in years
    
    Returns:
        ROI calculation
    """
    total_return = final_value - initial_investment
    roi = (total_return / initial_investment) * 100
    annualized_roi = ((final_value / initial_investment) ** (1 / holding_period) - 1) * 100
    
    return {
        "initial_investment": initial_investment,
        "final_value": final_value,
        "total_return": round(total_return, 2),
        "roi": f"{roi:.2f}%",
        "holding_period": f"{holding_period} year(s)",
        "annualized_roi": f"{annualized_roi:.2f}%"
    }


def calculate_ratio(
    ratio_type: str,
    values: dict
) -> dict:
    """
    Calculate financial ratios
    
    Args:
        ratio_type: Type of ratio
        values: Dictionary of values needed
    
    Returns:
        Ratio calculation
    """
    ratios = {
        "current": lambda v: v.get("current_assets", 0) / v.get("current_liabilities", 1),
        "quick": lambda v: (v.get("current_assets", 0) - v.get("inventory", 0)) / v.get("current_liabilities", 1),
        "debt_to_equity": lambda v: v.get("total_liabilities", 0) / v.get("total_equity", 1),
        "gross_margin": lambda v: (v.get("revenue", 0) - v.get("cogs", 0)) / v.get("revenue", 1) * 100,
        "net_margin": lambda v: v.get("net_income", 0) / v.get("revenue", 1) * 100,
        "roe": lambda v: v.get("net_income", 0) / v.get("total_equity", 1) * 100,
        "roa": lambda v: v.get("net_income", 0) / v.get("total_assets", 1) * 100,
    }
    
    if ratio_type.lower() in ratios:
        value = ratios[ratio_type.lower()](values)
        return {
            "ratio": ratio_type,
            "value": round(value, 2),
            "formula": _get_ratio_formula(ratio_type)
        }
    
    return {"error": f"Unknown ratio: {ratio_type}"}


def _get_ratio_formula(ratio_type: str) -> str:
    formulas = {
        "current": "Current Assets / Current Liabilities",
        "quick": "(Current Assets - Inventory) / Current Liabilities",
        "debt_to_equity": "Total Liabilities / Total Equity",
        "gross_margin": "(Revenue - COGS) / Revenue × 100",
        "net_margin": "Net Income / Revenue × 100",
        "roe": "Net Income / Total Equity × 100",
        "roa": "Net Income / Total Assets × 100",
    }
    return formulas.get(ratio_type, "Unknown")
