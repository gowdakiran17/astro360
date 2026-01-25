"""
Parallel Processing Module for Period Analysis
Implements efficient parallel computation of daily scores and events
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Callable
from multiprocessing import Pool, cpu_count
from functools import partial
import traceback


def generate_date_range(start_date: datetime, end_date: datetime) -> List[datetime]:
    """
    Generate a list of dates between start and end (inclusive).
    
    Args:
        start_date: Start date
        end_date: End date
        
    Returns:
        List of datetime objects
    """
    dates = []
    current = start_date
    while current <= end_date:
        dates.append(current)
        current += timedelta(days=1)
    return dates


def process_single_day(date: datetime, context: Dict[str, Any], 
                      calculator_func: Callable) -> Dict[str, Any]:
    """
    Process a single day's calculations.
    
    This function is designed to be called in parallel.
    
    Args:
        date: Date to process
        context: Context dictionary with birth details, etc.
        calculator_func: Function to calculate day score
        
    Returns:
        Dictionary with day's data
    """
    try:
        result = calculator_func(date, context)
        return result
    except Exception as e:
        # Return error result instead of crashing
        return {
            'date': date.strftime('%Y-%m-%d'),
            'error': str(e),
            'traceback': traceback.format_exc(),
            'score': 0
        }


def process_days_parallel(dates: List[datetime], context: Dict[str, Any],
                         calculator_func: Callable, 
                         max_workers: int = None) -> List[Dict[str, Any]]:
    """
    Process multiple days in parallel.
    
    Args:
        dates: List of dates to process
        context: Context dictionary with birth details, etc.
        calculator_func: Function to calculate day score
        max_workers: Maximum number of parallel workers (default: CPU count)
        
    Returns:
        List of results for each day
    """
    if max_workers is None:
        max_workers = min(cpu_count(), len(dates))
    
    # Create partial function with fixed context and calculator
    process_func = partial(process_single_day, 
                          context=context, 
                          calculator_func=calculator_func)
    
    # Use multiprocessing Pool for parallel execution
    with Pool(processes=max_workers) as pool:
        results = pool.map(process_func, dates)
    
    return results


def process_days_sequential(dates: List[datetime], context: Dict[str, Any],
                            calculator_func: Callable) -> List[Dict[str, Any]]:
    """
    Process multiple days sequentially (for debugging or small datasets).
    
    Args:
        dates: List of dates to process
        context: Context dictionary with birth details, etc.
        calculator_func: Function to calculate day score
        
    Returns:
        List of results for each day
    """
    results = []
    for date in dates:
        result = process_single_day(date, context, calculator_func)
        results.append(result)
    return results


def calculate_month_parallel(year: int, month: int, context: Dict[str, Any],
                             calculator_func: Callable,
                             use_parallel: bool = True,
                             max_workers: int = None) -> List[Dict[str, Any]]:
    """
    Calculate all days in a month, optionally using parallel processing.
    
    Args:
        year: Year
        month: Month (1-12)
        context: Context dictionary with birth details, etc.
        calculator_func: Function to calculate day score
        use_parallel: Whether to use parallel processing
        max_workers: Maximum number of parallel workers
        
    Returns:
        List of results for each day in the month
    """
    # Generate date range for the month
    first_day = datetime(year, month, 1)
    
    # Calculate last day of month
    if month == 12:
        last_day = datetime(year, 12, 31)
    else:
        last_day = datetime(year, month + 1, 1) - timedelta(days=1)
    
    dates = generate_date_range(first_day, last_day)
    
    # Process dates
    if use_parallel and len(dates) > 5:  # Only use parallel for larger datasets
        results = process_days_parallel(dates, context, calculator_func, max_workers)
    else:
        results = process_days_sequential(dates, context, calculator_func)
    
    return results


def batch_process_events(dates: List[datetime], context: Dict[str, Any],
                         event_calculators: List[Callable],
                         use_parallel: bool = True) -> Dict[datetime, List[Dict[str, Any]]]:
    """
    Process multiple event calculators for multiple dates.
    
    Args:
        dates: List of dates to process
        context: Context dictionary
        event_calculators: List of event calculator functions
        use_parallel: Whether to use parallel processing
        
    Returns:
        Dictionary mapping dates to lists of event results
    """
    def calculate_events_for_date(date: datetime, ctx: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate all events for a single date"""
        events = []
        for calc in event_calculators:
            try:
                result = calc(date, ctx)
                if result.get('occurred', False):
                    events.append(result)
            except Exception as e:
                # Log error but continue
                print(f"Error calculating event for {date}: {e}")
        
        return {
            'date': date,
            'events': events
        }
    
    # Create partial function
    calc_func = partial(calculate_events_for_date, ctx=context)
    
    if use_parallel and len(dates) > 5:
        with Pool(processes=min(cpu_count(), len(dates))) as pool:
            results = pool.map(calc_func, dates)
    else:
        results = [calc_func(date) for date in dates]
    
    # Convert to dictionary
    return {r['date']: r['events'] for r in results}
