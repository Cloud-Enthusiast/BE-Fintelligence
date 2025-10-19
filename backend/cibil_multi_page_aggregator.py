"""
Multi-page aggregation module for comprehensive CIBIL report analysis.
Handles data consolidation across multiple report pages and sections.
"""

import re
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@dataclass
class AccountInfo:
    """Structured account information"""
    account_number: str
    bank_name: str
    loan_type: str
    sanctioned_amount: Optional[str] = None
    current_balance: Optional[str] = None
    overdue_amount: Optional[str] = None
    account_status: Optional[str] = None
    opening_date: Optional[str] = None
    last_payment_date: Optional[str] = None
    payment_history: List[str] = None
    page_number: int = 0
    
    def __post_init__(self):
        if self.payment_history is None:
            self.payment_history = []

@dataclass
class CibilSection:
    """Represents a section of the CIBIL report"""
    section_type: str  # 'summary', 'account_details', 'enquiry_summary', 'payment_history'
    page_number: int
    content: str
    extracted_data: Dict[str, Any]
    confidence: float = 0.0

@dataclass
class AggregatedCibilData:
    """Consolidated CIBIL data from multiple pages"""
    report_summary: Dict[str, Any]
    all_accounts: List[AccountInfo]
    consolidated_financial_data: Dict[str, Any]
    payment_history_summary: Dict[str, Any]
    enquiry_summary: Dict[str, Any]
    data_quality_metrics: Dict[str, Any]
    processing_metadata: Dict[str, Any]

class CibilMultiPageAggregator:
    """
    Aggregates CIBIL data across multiple report pages and sections.
    Handles data consolidation, deduplication, and comprehensive analysis.
    """
    
    # Section identification patterns
    SECTION_PATTERNS = {
        'summary': [
            r'(?i)(?:cibil\s*)?(?:credit\s*)?(?:report\s*)?summary',
            r'(?i)consumer\s*credit\s*report',
            r'(?i)credit\s*profile\s*summary'
        ],
        'account_details': [
            r'(?i)account\s*(?:details|information|summary)',
            r'(?i)credit\s*(?:accounts|facilities)',
            r'(?i)loan\s*(?:details|accounts)'
        ],
        'enquiry_summary': [
            r'(?i)enquir(?:y|ies)\s*summary',
            r'(?i)credit\s*enquir(?:y|ies)',
            r'(?i)recent\s*enquir(?:y|ies)'
        ],
        'payment_history': [
            r'(?i)payment\s*history',
            r'(?i)repayment\s*(?:history|track\s*record)',
            r'(?i)account\s*payment\s*history'
        ]
    }
    
    # Account consolidation patterns
    ACCOUNT_PATTERNS = {
        'account_number': [
            r'(?i)(?:account\s*(?:no|number)|a/c\s*no)\s*:?\s*([A-Z0-9]{8,25})',
            r'(?i)loan\s*(?:no|number)\s*:?\s*([A-Z0-9]{8,25})',
            r'(?i)card\s*(?:no|number)\s*:?\s*([A-Z0-9]{8,25})'
        ],
        'bank_name': [
            r'(?i)(?:bank|lender|institution)\s*:?\s*([A-Z][A-Za-z\s&]+(?:bank|financial|nbfc|ltd|limited))',
            r'(?i)member\s*name\s*:?\s*([A-Z][A-Za-z\s&]+(?:bank|financial|nbfc|ltd|limited))'
        ],
        'loan_type': [
            r'(?i)(?:loan\s*type|account\s*type|facility\s*type)\s*:?\s*([A-Za-z\s]+)',
            r'(?i)(?:personal|home|car|auto|education|business|credit\s*card|overdraft)\s*(?:loan|account|facility)'
        ],
        'sanctioned_amount': [
            r'(?i)(?:sanctioned|approved|credit\s*limit)\s*(?:amount)?\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)',
            r'(?i)(?:limit|principal)\s*(?:amount)?\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)'
        ],
        'current_balance': [
            r'(?i)(?:current\s*balance|outstanding)\s*(?:amount)?\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)',
            r'(?i)(?:balance|dues)\s*(?:amount)?\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)'
        ],
        'overdue_amount': [
            r'(?i)(?:overdue|past\s*due)\s*(?:amount)?\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)',
            r'(?i)(?:arrears|default)\s*(?:amount)?\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)'
        ],
        'account_status': [
            r'(?i)(?:account\s*status|status)\s*:?\s*(active|closed|settled|written\s*off|suit\s*filed|default)',
            r'(?i)(active|closed|settled|written\s*off|suit\s*filed|default)\s*account'
        ]
    }
    
    # Financial summary patterns
    FINANCIAL_PATTERNS = {
        'cibil_score': [
            r'(?i)(?:cibil\s*)?(?:credit\s*)?score\s*:?\s*(\d{3})',
            r'(?i)(\d{3})\s*(?:cibil|credit|score)',
            r'(?i)your\s*(?:cibil\s*)?score\s*(?:is\s*)?:?\s*(\d{3})'
        ],
        'total_accounts': [
            r'(?i)(?:total\s*)?(?:number\s*of\s*)?(?:active\s*)?(?:accounts|loans)\s*:?\s*(\d+)',
            r'(?i)(\d+)\s*(?:active\s*)?(?:accounts|loans)\s*(?:found|reported)'
        ],
        'enquiries_count': [
            r'(?i)(?:total\s*)?(?:number\s*of\s*)?enquir(?:y|ies)\s*:?\s*(\d+)',
            r'(?i)(\d+)\s*enquir(?:y|ies)\s*(?:in|during)'
        ]
    }
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
    def aggregate_multi_page_data(self, pages_data: List[Dict[str, Any]]) -> AggregatedCibilData:
        """
        Main method to aggregate CIBIL data across multiple pages
        
        Args:
            pages_data: List of page data dictionaries from CIBIL processor
            
        Returns:
            AggregatedCibilData with consolidated information
        """
        try:
            self.logger.info(f"Starting multi-page aggregation for {len(pages_data)} pages")
            
            # Step 1: Identify sections across pages
            sections = self._identify_sections(pages_data)
            
            # Step 2: Extract and consolidate account information
            all_accounts = self._consolidate_accounts(sections, pages_data)
            
            # Step 3: Aggregate financial data
            financial_data = self._aggregate_financial_data(sections, pages_data)
            
            # Step 4: Consolidate payment history
            payment_history = self._consolidate_payment_history(sections, pages_data)
            
            # Step 5: Aggregate enquiry information
            enquiry_summary = self._aggregate_enquiry_data(sections, pages_data)
            
            # Step 6: Calculate data quality metrics
            quality_metrics = self._calculate_aggregation_quality(pages_data, all_accounts, financial_data)
            
            # Step 7: Create processing metadata
            processing_metadata = self._create_processing_metadata(pages_data, sections)
            
            # Step 8: Generate report summary
            report_summary = self._generate_report_summary(all_accounts, financial_data, payment_history, enquiry_summary)
            
            return AggregatedCibilData(
                report_summary=report_summary,
                all_accounts=all_accounts,
                consolidated_financial_data=financial_data,
                payment_history_summary=payment_history,
                enquiry_summary=enquiry_summary,
                data_quality_metrics=quality_metrics,
                processing_metadata=processing_metadata
            )
            
        except Exception as e:
            self.logger.error(f"Multi-page aggregation failed: {str(e)}")
            raise
    
    def _identify_sections(self, pages_data: List[Dict[str, Any]]) -> List[CibilSection]:
        """Identify different sections across all pages"""
        sections = []
        
        for page_idx, page_data in enumerate(pages_data):
            page_number = page_idx + 1
            text = page_data.get('text', '')
            
            # Check each section type
            for section_type, patterns in self.SECTION_PATTERNS.items():
                for pattern in patterns:
                    if re.search(pattern, text):
                        # Extract section content (simplified - could be more sophisticated)
                        section_content = self._extract_section_content(text, pattern)
                        
                        section = CibilSection(
                            section_type=section_type,
                            page_number=page_number,
                            content=section_content,
                            extracted_data={},
                            confidence=self._calculate_section_confidence(section_content, section_type)
                        )
                        sections.append(section)
                        break  # Found section, move to next type
        
        return sections
    
    def _extract_section_content(self, text: str, pattern: str) -> str:
        """Extract content for a specific section"""
        # Find the section start
        match = re.search(pattern, text, re.IGNORECASE)
        if not match:
            return ""
        
        start_pos = match.start()
        
        # Try to find section end (next major section or end of text)
        section_end_patterns = [
            r'(?i)(?:summary|details|history|enquir(?:y|ies))',
            r'(?i)(?:page\s*\d+|end\s*of\s*report)'
        ]
        
        end_pos = len(text)
        for end_pattern in section_end_patterns:
            end_match = re.search(end_pattern, text[start_pos + 100:], re.IGNORECASE)
            if end_match:
                end_pos = start_pos + 100 + end_match.start()
                break
        
        return text[start_pos:end_pos].strip()
    
    def _calculate_section_confidence(self, content: str, section_type: str) -> float:
        """Calculate confidence score for section identification"""
        if not content:
            return 0.0
        
        confidence = 0.3  # Base confidence
        
        # Add confidence based on content length
        if len(content) > 200:
            confidence += 0.2
        elif len(content) > 100:
            confidence += 0.1
        
        # Add confidence based on section-specific keywords
        section_keywords = {
            'summary': ['score', 'total', 'summary', 'overview'],
            'account_details': ['account', 'loan', 'bank', 'amount'],
            'enquiry_summary': ['enquiry', 'inquiry', 'recent', 'last'],
            'payment_history': ['payment', 'history', 'months', 'delay']
        }
        
        keywords = section_keywords.get(section_type, [])
        keyword_count = sum(1 for keyword in keywords if keyword.lower() in content.lower())
        confidence += min(keyword_count * 0.1, 0.4)
        
        return min(confidence, 1.0)
    
    def _consolidate_accounts(self, sections: List[CibilSection], pages_data: List[Dict[str, Any]]) -> List[AccountInfo]:
        """Consolidate account information from all pages"""
        accounts = []
        seen_accounts = set()  # To avoid duplicates
        
        # Process account details sections first
        account_sections = [s for s in sections if s.section_type == 'account_details']
        
        for section in account_sections:
            section_accounts = self._extract_accounts_from_section(section)
            for account in section_accounts:
                # Use account number as unique identifier
                if account.account_number and account.account_number not in seen_accounts:
                    accounts.append(account)
                    seen_accounts.add(account.account_number)
        
        # If no dedicated account sections, extract from all pages
        if not accounts:
            for page_idx, page_data in enumerate(pages_data):
                page_accounts = self._extract_accounts_from_text(page_data.get('text', ''), page_idx + 1)
                for account in page_accounts:
                    if account.account_number and account.account_number not in seen_accounts:
                        accounts.append(account)
                        seen_accounts.add(account.account_number)
        
        # Enhance accounts with additional data from other sections
        self._enhance_accounts_with_additional_data(accounts, sections, pages_data)
        
        return accounts
    
    def _extract_accounts_from_section(self, section: CibilSection) -> List[AccountInfo]:
        """Extract account information from a specific section"""
        return self._extract_accounts_from_text(section.content, section.page_number)
    
    def _extract_accounts_from_text(self, text: str, page_number: int) -> List[AccountInfo]:
        """Extract account information from text"""
        accounts = []
        
        # Try to find account blocks (text between account identifiers)
        account_blocks = self._split_into_account_blocks(text)
        
        for block in account_blocks:
            account_data = {}
            
            # Extract each field using patterns
            for field, patterns in self.ACCOUNT_PATTERNS.items():
                for pattern in patterns:
                    match = re.search(pattern, block, re.IGNORECASE)
                    if match:
                        account_data[field] = match.group(1).strip()
                        break
            
            # Create account if we have at least account number or bank name
            if account_data.get('account_number') or account_data.get('bank_name'):
                account = AccountInfo(
                    account_number=account_data.get('account_number', ''),
                    bank_name=account_data.get('bank_name', ''),
                    loan_type=account_data.get('loan_type', ''),
                    sanctioned_amount=account_data.get('sanctioned_amount'),
                    current_balance=account_data.get('current_balance'),
                    overdue_amount=account_data.get('overdue_amount'),
                    account_status=account_data.get('account_status'),
                    page_number=page_number
                )
                accounts.append(account)
        
        return accounts
    
    def _split_into_account_blocks(self, text: str) -> List[str]:
        """Split text into potential account blocks"""
        # Look for account separators
        separators = [
            r'(?i)account\s*(?:no|number)',
            r'(?i)loan\s*(?:no|number)',
            r'(?i)member\s*name',
            r'(?i)bank\s*name'
        ]
        
        blocks = []
        current_block = ""
        
        lines = text.split('\n')
        for line in lines:
            is_separator = any(re.search(sep, line) for sep in separators)
            
            if is_separator and current_block.strip():
                blocks.append(current_block.strip())
                current_block = line
            else:
                current_block += "\n" + line
        
        # Add the last block
        if current_block.strip():
            blocks.append(current_block.strip())
        
        # If no clear separators found, return the whole text as one block
        if len(blocks) <= 1:
            return [text]
        
        return blocks
    
    def _enhance_accounts_with_additional_data(self, accounts: List[AccountInfo], sections: List[CibilSection], pages_data: List[Dict[str, Any]]):
        """Enhance account data with information from payment history and other sections"""
        # Extract payment history for each account
        payment_sections = [s for s in sections if s.section_type == 'payment_history']
        
        for account in accounts:
            # Try to find payment history for this account
            for section in payment_sections:
                payment_data = self._extract_payment_history_for_account(section.content, account.account_number)
                if payment_data:
                    account.payment_history = payment_data
                    break
            
            # Try to find additional dates
            for page_data in pages_data:
                if account.account_number in page_data.get('text', ''):
                    dates = self._extract_dates_near_account(page_data.get('text', ''), account.account_number)
                    if dates:
                        account.opening_date = dates.get('opening_date')
                        account.last_payment_date = dates.get('last_payment_date')
                    break
    
    def _extract_payment_history_for_account(self, text: str, account_number: str) -> List[str]:
        """Extract payment history for a specific account"""
        if not account_number:
            return []
        
        # Look for payment history patterns near the account number
        account_section = self._find_text_around_account(text, account_number)
        if not account_section:
            return []
        
        # Extract payment indicators (0, 30, 60, 90, etc.)
        payment_pattern = r'\b(0|30|60|90|120|150|180|XXX|STD|SMA|SUB|DBT|LSS)\b'
        payment_history = re.findall(payment_pattern, account_section)
        
        return payment_history[:24]  # Limit to 24 months
    
    def _find_text_around_account(self, text: str, account_number: str) -> str:
        """Find text around an account number"""
        if not account_number:
            return ""
        
        # Find account number position
        account_pos = text.find(account_number)
        if account_pos == -1:
            return ""
        
        # Extract text around the account (500 characters before and after)
        start = max(0, account_pos - 500)
        end = min(len(text), account_pos + len(account_number) + 500)
        
        return text[start:end]
    
    def _extract_dates_near_account(self, text: str, account_number: str) -> Dict[str, str]:
        """Extract dates near an account number"""
        account_section = self._find_text_around_account(text, account_number)
        if not account_section:
            return {}
        
        dates = {}
        
        # Look for opening date patterns
        opening_patterns = [
            r'(?i)(?:opened|opening|start)\s*(?:date)?\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
            r'(?i)(?:from|since)\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})'
        ]
        
        for pattern in opening_patterns:
            match = re.search(pattern, account_section)
            if match:
                dates['opening_date'] = match.group(1)
                break
        
        # Look for last payment date patterns
        payment_patterns = [
            r'(?i)(?:last\s*payment|recent\s*payment)\s*(?:date)?\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
            r'(?i)(?:paid\s*on|payment\s*on)\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})'
        ]
        
        for pattern in payment_patterns:
            match = re.search(pattern, account_section)
            if match:
                dates['last_payment_date'] = match.group(1)
                break
        
        return dates
    
    def _aggregate_financial_data(self, sections: List[CibilSection], pages_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate financial data from all pages"""
        financial_data = {
            'cibil_score': None,
            'total_accounts': 0,
            'total_sanctioned_amount': 0,
            'total_current_balance': 0,
            'total_overdue_amount': 0,
            'account_status_summary': {},
            'loan_type_summary': {},
            'bank_wise_summary': {}
        }
        
        all_text = " ".join([page.get('text', '') for page in pages_data])
        
        # Extract CIBIL score
        for pattern in self.FINANCIAL_PATTERNS['cibil_score']:
            match = re.search(pattern, all_text)
            if match:
                score = int(match.group(1))
                if 300 <= score <= 900:  # Valid CIBIL score range
                    financial_data['cibil_score'] = score
                    break
        
        # Extract total accounts count
        for pattern in self.FINANCIAL_PATTERNS['total_accounts']:
            match = re.search(pattern, all_text)
            if match:
                financial_data['total_accounts'] = int(match.group(1))
                break
        
        return financial_data
    
    def _consolidate_payment_history(self, sections: List[CibilSection], pages_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Consolidate payment history information"""
        payment_summary = {
            'total_delay_instances': 0,
            'delay_categories': {
                '0': 0,      # On time
                '30': 0,     # 1-30 days late
                '60': 0,     # 31-60 days late
                '90': 0,     # 61-90 days late
                '120+': 0    # 90+ days late
            },
            'payment_behavior_score': 0,
            'recent_payment_trend': 'stable'
        }
        
        # Collect all payment history data
        all_payment_data = []
        payment_sections = [s for s in sections if s.section_type == 'payment_history']
        
        for section in payment_sections:
            payment_indicators = re.findall(r'\b(0|30|60|90|120|150|180|XXX|STD|SMA|SUB|DBT|LSS)\b', section.content)
            all_payment_data.extend(payment_indicators)
        
        # If no dedicated payment sections, look in all pages
        if not all_payment_data:
            all_text = " ".join([page.get('text', '') for page in pages_data])
            all_payment_data = re.findall(r'\b(0|30|60|90|120|150|180|XXX|STD|SMA|SUB|DBT|LSS)\b', all_text)
        
        # Analyze payment data
        for indicator in all_payment_data:
            if indicator == '0':
                payment_summary['delay_categories']['0'] += 1
            elif indicator in ['30']:
                payment_summary['delay_categories']['30'] += 1
                payment_summary['total_delay_instances'] += 1
            elif indicator in ['60']:
                payment_summary['delay_categories']['60'] += 1
                payment_summary['total_delay_instances'] += 1
            elif indicator in ['90']:
                payment_summary['delay_categories']['90'] += 1
                payment_summary['total_delay_instances'] += 1
            elif indicator in ['120', '150', '180', 'XXX', 'STD', 'SMA', 'SUB', 'DBT', 'LSS']:
                payment_summary['delay_categories']['120+'] += 1
                payment_summary['total_delay_instances'] += 1
        
        # Calculate payment behavior score (0-100)
        total_payments = sum(payment_summary['delay_categories'].values())
        if total_payments > 0:
            on_time_ratio = payment_summary['delay_categories']['0'] / total_payments
            payment_summary['payment_behavior_score'] = int(on_time_ratio * 100)
        
        return payment_summary
    
    def _aggregate_enquiry_data(self, sections: List[CibilSection], pages_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate enquiry information"""
        enquiry_summary = {
            'total_enquiries': 0,
            'recent_enquiries_6m': 0,
            'recent_enquiries_12m': 0,
            'enquiry_types': {},
            'enquiring_institutions': []
        }
        
        enquiry_sections = [s for s in sections if s.section_type == 'enquiry_summary']
        
        for section in enquiry_sections:
            # Extract total enquiries
            for pattern in self.FINANCIAL_PATTERNS['enquiries_count']:
                match = re.search(pattern, section.content)
                if match:
                    enquiry_summary['total_enquiries'] = int(match.group(1))
                    break
            
            # Extract enquiring institutions
            institution_pattern = r'(?i)(?:bank|financial|nbfc|institution)\s*:?\s*([A-Z][A-Za-z\s&]+(?:bank|financial|nbfc|ltd|limited))'
            institutions = re.findall(institution_pattern, section.content)
            enquiry_summary['enquiring_institutions'].extend(institutions)
        
        # Remove duplicates
        enquiry_summary['enquiring_institutions'] = list(set(enquiry_summary['enquiring_institutions']))
        
        return enquiry_summary
    
    def _calculate_aggregation_quality(self, pages_data: List[Dict[str, Any]], accounts: List[AccountInfo], financial_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate quality metrics for the aggregation process"""
        total_pages = len(pages_data)
        pages_with_accounts = sum(1 for page in pages_data if any(acc.page_number == pages_data.index(page) + 1 for acc in accounts))
        
        quality_metrics = {
            'aggregation_completeness': 0,
            'data_consistency_score': 0,
            'cross_page_validation_score': 0,
            'account_consolidation_quality': 0,
            'overall_aggregation_quality': 0
        }
        
        # Calculate aggregation completeness
        expected_data_points = ['cibil_score', 'accounts', 'financial_summary']
        found_data_points = 0
        
        if financial_data.get('cibil_score'):
            found_data_points += 1
        if accounts:
            found_data_points += 1
        if financial_data.get('total_accounts'):
            found_data_points += 1
        
        quality_metrics['aggregation_completeness'] = found_data_points / len(expected_data_points)
        
        # Calculate account consolidation quality
        if accounts:
            accounts_with_complete_data = sum(1 for acc in accounts if acc.account_number and acc.bank_name and acc.loan_type)
            quality_metrics['account_consolidation_quality'] = accounts_with_complete_data / len(accounts)
        
        # Calculate overall quality
        quality_metrics['overall_aggregation_quality'] = (
            quality_metrics['aggregation_completeness'] * 0.4 +
            quality_metrics['account_consolidation_quality'] * 0.6
        )
        
        return quality_metrics
    
    def _create_processing_metadata(self, pages_data: List[Dict[str, Any]], sections: List[CibilSection]) -> Dict[str, Any]:
        """Create metadata about the processing"""
        return {
            'total_pages_processed': len(pages_data),
            'sections_identified': len(sections),
            'section_types_found': list(set(s.section_type for s in sections)),
            'processing_timestamp': datetime.now().isoformat(),
            'aggregation_method': 'multi_page_comprehensive',
            'data_sources': [f"page_{i+1}" for i in range(len(pages_data))]
        }
    
    def _generate_report_summary(self, accounts: List[AccountInfo], financial_data: Dict[str, Any], 
                                payment_history: Dict[str, Any], enquiry_summary: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a comprehensive report summary"""
        return {
            'cibil_score': financial_data.get('cibil_score'),
            'total_accounts': len(accounts),
            'total_active_accounts': len([acc for acc in accounts if acc.account_status and 'active' in acc.account_status.lower()]),
            'total_closed_accounts': len([acc for acc in accounts if acc.account_status and 'closed' in acc.account_status.lower()]),
            'total_settled_accounts': len([acc for acc in accounts if acc.account_status and 'settled' in acc.account_status.lower()]),
            'payment_delay_instances': payment_history.get('total_delay_instances', 0),
            'payment_behavior_score': payment_history.get('payment_behavior_score', 0),
            'total_enquiries': enquiry_summary.get('total_enquiries', 0),
            'unique_banks': len(set(acc.bank_name for acc in accounts if acc.bank_name)),
            'loan_types': list(set(acc.loan_type for acc in accounts if acc.loan_type)),
            'accounts_with_overdue': len([acc for acc in accounts if acc.overdue_amount and acc.overdue_amount != '0']),
            'data_completeness_percentage': int(financial_data.get('total_accounts', 0) / max(len(accounts), 1) * 100) if accounts else 0
        }

# Factory function for easy integration
def create_multi_page_aggregator() -> CibilMultiPageAggregator:
    """Factory function to create a multi-page aggregator instance"""
    return CibilMultiPageAggregator()

# Utility function for direct aggregation
def aggregate_cibil_pages(pages_data: List[Dict[str, Any]]) -> AggregatedCibilData:
    """
    Utility function to aggregate CIBIL pages directly
    
    Args:
        pages_data: List of page data from CIBIL processor
        
    Returns:
        Aggregated CIBIL data
    """
    aggregator = create_multi_page_aggregator()
    return aggregator.aggregate_multi_page_data(pages_data)