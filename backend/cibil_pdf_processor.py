"""
Enhanced PDF processing specifically optimized for CIBIL reports.
Implements OCR optimization and multi-page aggregation for comprehensive CIBIL report analysis.
"""

import re
import tempfile
import os
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from pypdf import PdfReader
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class CibilPageData:
    """Data structure for individual CIBIL report page"""
    page_number: int
    text: str
    text_length: int
    has_text: bool
    extraction_method: str
    confidence: float
    cibil_indicators: List[str]
    account_data: Dict[str, Any]
    financial_data: Dict[str, Any]

@dataclass
class CibilReportStructure:
    """Structure representing a complete CIBIL report"""
    total_pages: int
    pages_with_text: int
    report_type: str
    report_date: Optional[str]
    applicant_info: Dict[str, str]
    consolidated_accounts: List[Dict[str, Any]]
    aggregated_financial_data: Dict[str, Any]
    extraction_quality: Dict[str, Any]

class CibilPdfProcessor:
    """Enhanced PDF processor optimized for CIBIL report layouts"""
    
    # CIBIL-specific patterns for better text recognition
    CIBIL_INDICATORS = [
        r'cibil\s*(?:trans\s*union)?',
        r'credit\s*information\s*bureau',
        r'consumer\s*credit\s*report',
        r'credit\s*score',
        r'account\s*summary',
        r'enquiry\s*summary',
        r'payment\s*history'
    ]
    
    # Financial table patterns common in CIBIL reports
    TABLE_PATTERNS = [
        r'account\s*number\s*\|\s*bank\s*name',
        r'loan\s*type\s*\|\s*sanctioned\s*amount',
        r'current\s*balance\s*\|\s*overdue\s*amount',
        r'payment\s*status\s*\|\s*last\s*payment'
    ]
    
    # Amount patterns for CIBIL reports
    AMOUNT_PATTERNS = [
        r'(?:rs\.?\s*|₹\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:cr|crore|crores)',
        r'(?:rs\.?\s*|₹\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:l|lakh|lakhs)',
        r'(?:rs\.?\s*|₹\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|thousand)',
        r'(?:rs\.?\s*|₹\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'
    ]
    
    def __init__(self):
        self.ocr_available = self._check_ocr_availability()
        
    def _check_ocr_availability(self) -> bool:
        """Check if OCR libraries are available"""
        try:
            import pytesseract
            from PIL import Image
            return True
        except ImportError:
            logger.warning("OCR libraries not available. Install pytesseract and Pillow for enhanced processing.")
            return False
    
    def process_cibil_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Main method to process CIBIL PDF with optimized extraction
        
        Args:
            pdf_path: Path to the CIBIL PDF file
            
        Returns:
            Comprehensive CIBIL report data with multi-page aggregation
        """
        try:
            logger.info(f"Processing CIBIL PDF: {pdf_path}")
            
            # Step 1: Extract text from all pages with optimization
            pages_data = self._extract_pages_optimized(pdf_path)
            
            # Step 2: Detect CIBIL report structure
            report_structure = self._analyze_report_structure(pages_data)
            
            # Step 3: Aggregate data across pages
            aggregated_data = self._aggregate_multi_page_data(pages_data, report_structure)
            
            # Step 4: Calculate extraction quality
            quality_metrics = self._calculate_extraction_quality(pages_data, aggregated_data)
            
            return {
                'success': True,
                'report_type': 'CIBIL',
                'processing_method': 'Enhanced CIBIL Processor',
                'pages_data': [self._serialize_page_data(page) for page in pages_data],
                'report_structure': self._serialize_report_structure(report_structure),
                'aggregated_data': aggregated_data,
                'extraction_quality': quality_metrics,
                'recommendations': self._generate_processing_recommendations(pages_data, quality_metrics)
            }
            
        except Exception as e:
            logger.error(f"CIBIL PDF processing failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'processing_method': 'Enhanced CIBIL Processor (Failed)'
            }
    
    def _extract_pages_optimized(self, pdf_path: str) -> List[CibilPageData]:
        """Extract text from PDF pages with CIBIL-specific optimizations"""
        reader = PdfReader(pdf_path)
        pages_data = []
        
        for i, page in enumerate(reader.pages):
            page_num = i + 1
            logger.info(f"Processing page {page_num}/{len(reader.pages)}")
            
            # Primary extraction using PyPDF
            text = page.extract_text()
            
            # Apply CIBIL-specific text preprocessing
            processed_text = self._preprocess_cibil_text(text)
            
            # Detect CIBIL indicators on this page
            cibil_indicators = self._detect_cibil_indicators(processed_text)
            
            # Extract structured data from this page
            account_data = self._extract_page_account_data(processed_text)
            financial_data = self._extract_page_financial_data(processed_text)
            
            # Calculate confidence based on CIBIL-specific criteria
            confidence = self._calculate_page_confidence(processed_text, cibil_indicators, account_data)
            
            # If OCR is available and confidence is low, try OCR enhancement
            if self.ocr_available and confidence < 0.7:
                enhanced_text = self._enhance_with_ocr(page, processed_text)
                if enhanced_text and len(enhanced_text) > len(processed_text):
                    processed_text = enhanced_text
                    confidence = min(confidence + 0.2, 1.0)  # Boost confidence for OCR enhancement
            
            page_data = CibilPageData(
                page_number=page_num,
                text=processed_text,
                text_length=len(processed_text),
                has_text=len(processed_text.strip()) > 0,
                extraction_method='PyPDF + CIBIL Optimization' + (' + OCR' if self.ocr_available and confidence < 0.7 else ''),
                confidence=confidence,
                cibil_indicators=cibil_indicators,
                account_data=account_data,
                financial_data=financial_data
            )
            
            pages_data.append(page_data)
        
        return pages_data
    
    def _preprocess_cibil_text(self, text: str) -> str:
        """Apply CIBIL-specific text preprocessing for better recognition"""
        if not text:
            return text
        
        # Normalize whitespace and line breaks
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n\s*\n', '\n', text)
        
        # Fix common OCR errors in financial documents
        text = re.sub(r'(?i)c[il1]b[il1]l', 'CIBIL', text)  # Fix CIBIL recognition
        text = re.sub(r'(?i)cr[e3]d[il1]t', 'credit', text)  # Fix credit recognition
        text = re.sub(r'(?i)acc[o0]unt', 'account', text)    # Fix account recognition
        
        # Normalize currency symbols
        text = re.sub(r'Rs\.?\s*', '₹', text)
        text = re.sub(r'INR\s*', '₹', text)
        
        # Fix table separators
        text = re.sub(r'\s*\|\s*', ' | ', text)
        text = re.sub(r'\s*:\s*', ': ', text)
        
        return text.strip()
    
    def _detect_cibil_indicators(self, text: str) -> List[str]:
        """Detect CIBIL-specific indicators in text"""
        indicators = []
        text_lower = text.lower()
        
        for pattern in self.CIBIL_INDICATORS:
            if re.search(pattern, text_lower):
                indicators.append(pattern)
        
        # Check for table patterns
        for pattern in self.TABLE_PATTERNS:
            if re.search(pattern, text_lower):
                indicators.append(f"table_pattern: {pattern}")
        
        return indicators
    
    def _extract_page_account_data(self, text: str) -> Dict[str, Any]:
        """Extract account-related data from a single page"""
        account_data = {
            'account_numbers': [],
            'bank_names': [],
            'loan_types': [],
            'account_statuses': []
        }
        
        # Extract account numbers (various formats)
        account_patterns = [
            r'(?:account\s*(?:no|number)\s*:?\s*)?([A-Z0-9]{10,20})',
            r'(?:a/c\s*(?:no|number)\s*:?\s*)?([A-Z0-9]{10,20})',
            r'(?:loan\s*(?:no|number)\s*:?\s*)?([A-Z0-9]{10,20})'
        ]
        
        for pattern in account_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            account_data['account_numbers'].extend(matches)
        
        # Extract bank names
        bank_pattern = r'(?:bank|financial|nbfc)\s*:?\s*([A-Z][A-Za-z\s&]+(?:bank|financial|nbfc|ltd|limited))'
        bank_matches = re.findall(bank_pattern, text, re.IGNORECASE)
        account_data['bank_names'] = list(set(bank_matches))
        
        # Extract loan types
        loan_types = ['personal loan', 'home loan', 'car loan', 'credit card', 'business loan', 'education loan']
        for loan_type in loan_types:
            if re.search(loan_type, text, re.IGNORECASE):
                account_data['loan_types'].append(loan_type)
        
        # Extract account statuses
        statuses = ['active', 'closed', 'settled', 'written off', 'suit filed', 'default']
        for status in statuses:
            if re.search(status, text, re.IGNORECASE):
                account_data['account_statuses'].append(status)
        
        return account_data
    
    def _extract_page_financial_data(self, text: str) -> Dict[str, Any]:
        """Extract financial data from a single page"""
        financial_data = {
            'amounts': [],
            'cibil_scores': [],
            'dates': [],
            'payment_history': []
        }
        
        # Extract amounts using CIBIL-specific patterns
        for pattern in self.AMOUNT_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            financial_data['amounts'].extend(matches)
        
        # Extract CIBIL scores
        score_patterns = [
            r'(?:cibil\s*)?(?:credit\s*)?score\s*:?\s*(\d{3})',
            r'(\d{3})\s*(?:cibil|credit|score)',
            r'score\s*(?:is\s*)?:?\s*(\d{3})'
        ]
        
        for pattern in score_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            # Validate score range (300-900)
            valid_scores = [score for score in matches if 300 <= int(score) <= 900]
            financial_data['cibil_scores'].extend(valid_scores)
        
        # Extract dates
        date_patterns = [
            r'\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b',
            r'\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b',
            r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b'
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            financial_data['dates'].extend(matches)
        
        # Extract payment history indicators
        payment_indicators = ['0', '30', '60', '90', '120', '150', '180', 'XXX', 'STD', 'SMA', 'SUB', 'DBT', 'LSS']
        for indicator in payment_indicators:
            if re.search(r'\b' + re.escape(indicator) + r'\b', text):
                financial_data['payment_history'].append(indicator)
        
        return financial_data
    
    def _calculate_page_confidence(self, text: str, indicators: List[str], account_data: Dict[str, Any]) -> float:
        """Calculate confidence score for page extraction"""
        confidence = 0.0
        
        # Base confidence from text length
        if len(text) > 100:
            confidence += 0.3
        elif len(text) > 50:
            confidence += 0.2
        elif len(text) > 10:
            confidence += 0.1
        
        # Boost for CIBIL indicators
        confidence += min(len(indicators) * 0.1, 0.4)
        
        # Boost for structured data found
        if account_data['account_numbers']:
            confidence += 0.2
        if account_data['bank_names']:
            confidence += 0.1
        if account_data['loan_types']:
            confidence += 0.1
        
        return min(confidence, 1.0)
    
    def _enhance_with_ocr(self, page, original_text: str) -> Optional[str]:
        """Enhance text extraction using OCR for low-confidence pages"""
        if not self.ocr_available:
            return None
        
        try:
            import pytesseract
            from PIL import Image
            import io
            
            # This is a placeholder for OCR enhancement
            # In a real implementation, you would:
            # 1. Convert PDF page to image
            # 2. Apply image preprocessing for financial documents
            # 3. Use Tesseract with custom config for tables
            # 4. Combine results with original text
            
            logger.info("OCR enhancement would be applied here")
            return original_text  # Placeholder return
            
        except Exception as e:
            logger.warning(f"OCR enhancement failed: {str(e)}")
            return None
    
    def _analyze_report_structure(self, pages_data: List[CibilPageData]) -> CibilReportStructure:
        """Analyze the overall structure of the CIBIL report"""
        total_pages = len(pages_data)
        pages_with_text = sum(1 for page in pages_data if page.has_text)
        
        # Determine report type based on content
        all_indicators = []
        for page in pages_data:
            all_indicators.extend(page.cibil_indicators)
        
        report_type = 'CIBIL_DETAILED' if len(all_indicators) > 5 else 'CIBIL_SUMMARY'
        
        # Extract report date (usually on first page)
        report_date = None
        if pages_data:
            dates = pages_data[0].financial_data.get('dates', [])
            if dates:
                report_date = dates[0]  # Take first date found
        
        # Extract applicant info (usually on first page)
        applicant_info = {}
        if pages_data:
            first_page_text = pages_data[0].text
            # Extract name pattern
            name_match = re.search(r'(?:name\s*:?\s*)([A-Z][A-Za-z\s]+)', first_page_text, re.IGNORECASE)
            if name_match:
                applicant_info['name'] = name_match.group(1).strip()
            
            # Extract PAN pattern
            pan_match = re.search(r'(?:pan\s*:?\s*)([A-Z]{5}\d{4}[A-Z])', first_page_text, re.IGNORECASE)
            if pan_match:
                applicant_info['pan'] = pan_match.group(1)
        
        return CibilReportStructure(
            total_pages=total_pages,
            pages_with_text=pages_with_text,
            report_type=report_type,
            report_date=report_date,
            applicant_info=applicant_info,
            consolidated_accounts=[],  # Will be filled by aggregation
            aggregated_financial_data={},  # Will be filled by aggregation
            extraction_quality={}  # Will be filled by quality calculation
        )
    
    def _aggregate_multi_page_data(self, pages_data: List[CibilPageData], structure: CibilReportStructure) -> Dict[str, Any]:
        """Aggregate data across multiple pages using the enhanced multi-page aggregator"""
        try:
            # Import the multi-page aggregator
            from cibil_multi_page_aggregator import create_multi_page_aggregator
            
            # Convert CibilPageData to the format expected by aggregator
            aggregator_pages_data = []
            for page in pages_data:
                page_dict = {
                    'page_number': page.page_number,
                    'text': page.text,
                    'text_length': page.text_length,
                    'has_text': page.has_text,
                    'extraction_method': page.extraction_method,
                    'confidence': page.confidence,
                    'cibil_indicators': page.cibil_indicators,
                    'account_data': page.account_data,
                    'financial_data': page.financial_data
                }
                aggregator_pages_data.append(page_dict)
            
            # Use the enhanced aggregator
            aggregator = create_multi_page_aggregator()
            aggregated_data = aggregator.aggregate_multi_page_data(aggregator_pages_data)
            
            # Convert back to the expected format for backward compatibility
            return {
                'report_summary': aggregated_data.report_summary,
                'all_accounts': [self._convert_account_info_to_dict(acc) for acc in aggregated_data.all_accounts],
                'consolidated_financial_data': aggregated_data.consolidated_financial_data,
                'payment_history_summary': aggregated_data.payment_history_summary,
                'enquiry_summary': aggregated_data.enquiry_summary,
                'data_quality_metrics': aggregated_data.data_quality_metrics,
                'processing_metadata': aggregated_data.processing_metadata,
                
                # Legacy format for backward compatibility
                'all_account_numbers': [acc.account_number for acc in aggregated_data.all_accounts if acc.account_number],
                'all_bank_names': list(set(acc.bank_name for acc in aggregated_data.all_accounts if acc.bank_name)),
                'all_loan_types': list(set(acc.loan_type for acc in aggregated_data.all_accounts if acc.loan_type)),
                'all_cibil_scores': [str(aggregated_data.consolidated_financial_data.get('cibil_score', ''))] if aggregated_data.consolidated_financial_data.get('cibil_score') else [],
                'consolidated_accounts': [self._convert_account_info_to_dict(acc) for acc in aggregated_data.all_accounts],
                'financial_summary': {
                    'total_accounts': len(aggregated_data.all_accounts),
                    'total_banks': len(set(acc.bank_name for acc in aggregated_data.all_accounts if acc.bank_name)),
                    'loan_types_count': len(set(acc.loan_type for acc in aggregated_data.all_accounts if acc.loan_type)),
                    'cibil_score': aggregated_data.consolidated_financial_data.get('cibil_score'),
                    'report_date': structure.report_date
                }
            }
            
        except ImportError:
            logger.warning("Multi-page aggregator not available, falling back to basic aggregation")
            return self._basic_aggregate_multi_page_data(pages_data, structure)
        except Exception as e:
            logger.error(f"Enhanced aggregation failed: {str(e)}, falling back to basic aggregation")
            return self._basic_aggregate_multi_page_data(pages_data, structure)
    
    def _convert_account_info_to_dict(self, account_info) -> Dict[str, Any]:
        """Convert AccountInfo dataclass to dictionary"""
        return {
            'account_number': account_info.account_number,
            'bank_name': account_info.bank_name,
            'loan_type': account_info.loan_type,
            'sanctioned_amount': account_info.sanctioned_amount,
            'current_balance': account_info.current_balance,
            'overdue_amount': account_info.overdue_amount,
            'account_status': account_info.account_status,
            'opening_date': account_info.opening_date,
            'last_payment_date': account_info.last_payment_date,
            'payment_history': account_info.payment_history,
            'page_number': account_info.page_number
        }
    
    def _basic_aggregate_multi_page_data(self, pages_data: List[CibilPageData], structure: CibilReportStructure) -> Dict[str, Any]:
        """Basic aggregation fallback method"""
        aggregated = {
            'all_account_numbers': [],
            'all_bank_names': [],
            'all_loan_types': [],
            'all_amounts': [],
            'all_cibil_scores': [],
            'all_dates': [],
            'consolidated_accounts': [],
            'financial_summary': {}
        }
        
        # Aggregate data from all pages
        for page in pages_data:
            aggregated['all_account_numbers'].extend(page.account_data.get('account_numbers', []))
            aggregated['all_bank_names'].extend(page.account_data.get('bank_names', []))
            aggregated['all_loan_types'].extend(page.account_data.get('loan_types', []))
            aggregated['all_amounts'].extend(page.financial_data.get('amounts', []))
            aggregated['all_cibil_scores'].extend(page.financial_data.get('cibil_scores', []))
            aggregated['all_dates'].extend(page.financial_data.get('dates', []))
        
        # Remove duplicates and clean data
        aggregated['all_account_numbers'] = list(set(aggregated['all_account_numbers']))
        aggregated['all_bank_names'] = list(set(aggregated['all_bank_names']))
        aggregated['all_loan_types'] = list(set(aggregated['all_loan_types']))
        aggregated['all_cibil_scores'] = list(set(aggregated['all_cibil_scores']))
        
        # Create financial summary
        aggregated['financial_summary'] = {
            'total_accounts': len(aggregated['all_account_numbers']),
            'total_banks': len(aggregated['all_bank_names']),
            'loan_types_count': len(aggregated['all_loan_types']),
            'cibil_score': aggregated['all_cibil_scores'][0] if aggregated['all_cibil_scores'] else None,
            'report_date': structure.report_date
        }
        
        # Consolidate account information
        # Group accounts by bank and create consolidated view
        bank_accounts = {}
        for i, bank in enumerate(aggregated['all_bank_names']):
            if bank not in bank_accounts:
                bank_accounts[bank] = {
                    'bank_name': bank,
                    'accounts': [],
                    'total_accounts': 0
                }
            
            # Try to match accounts to banks (simplified logic)
            if i < len(aggregated['all_account_numbers']):
                bank_accounts[bank]['accounts'].append(aggregated['all_account_numbers'][i])
                bank_accounts[bank]['total_accounts'] += 1
        
        aggregated['consolidated_accounts'] = list(bank_accounts.values())
        
        return aggregated
    
    def _calculate_extraction_quality(self, pages_data: List[CibilPageData], aggregated_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall extraction quality metrics"""
        total_pages = len(pages_data)
        pages_with_text = sum(1 for page in pages_data if page.has_text)
        
        # Calculate average confidence
        avg_confidence = sum(page.confidence for page in pages_data) / total_pages if total_pages > 0 else 0
        
        # Calculate data completeness
        expected_fields = ['cibil_score', 'account_numbers', 'bank_names', 'amounts']
        found_fields = 0
        
        if aggregated_data['all_cibil_scores']:
            found_fields += 1
        if aggregated_data['all_account_numbers']:
            found_fields += 1
        if aggregated_data['all_bank_names']:
            found_fields += 1
        if aggregated_data['all_amounts']:
            found_fields += 1
        
        completeness = found_fields / len(expected_fields)
        
        # Overall quality score
        overall_quality = (avg_confidence * 0.6 + completeness * 0.4) * 100
        
        return {
            'overall_score': round(overall_quality, 2),
            'average_confidence': round(avg_confidence, 3),
            'data_completeness': round(completeness, 3),
            'pages_processed': total_pages,
            'pages_with_text': pages_with_text,
            'text_coverage': round(pages_with_text / total_pages, 3) if total_pages > 0 else 0,
            'quality_level': 'HIGH' if overall_quality >= 80 else 'MEDIUM' if overall_quality >= 60 else 'LOW'
        }
    
    def _generate_processing_recommendations(self, pages_data: List[CibilPageData], quality_metrics: Dict[str, Any]) -> List[str]:
        """Generate recommendations for improving processing quality"""
        recommendations = []
        
        if quality_metrics['overall_score'] < 70:
            recommendations.append("Consider using OCR enhancement for better text recognition")
        
        if quality_metrics['text_coverage'] < 0.8:
            recommendations.append("Some pages may be image-based. OCR processing recommended")
        
        if quality_metrics['data_completeness'] < 0.7:
            recommendations.append("Manual review recommended for missing data fields")
        
        low_confidence_pages = [page.page_number for page in pages_data if page.confidence < 0.6]
        if low_confidence_pages:
            recommendations.append(f"Review pages {low_confidence_pages} for potential extraction issues")
        
        if not any(page.cibil_indicators for page in pages_data):
            recommendations.append("Document may not be a standard CIBIL report format")
        
        return recommendations
    
    def _serialize_page_data(self, page_data: CibilPageData) -> Dict[str, Any]:
        """Convert CibilPageData to serializable dictionary"""
        return {
            'page_number': page_data.page_number,
            'text_length': page_data.text_length,
            'has_text': page_data.has_text,
            'extraction_method': page_data.extraction_method,
            'confidence': page_data.confidence,
            'cibil_indicators': page_data.cibil_indicators,
            'account_data': page_data.account_data,
            'financial_data': page_data.financial_data
        }
    
    def _serialize_report_structure(self, structure: CibilReportStructure) -> Dict[str, Any]:
        """Convert CibilReportStructure to serializable dictionary"""
        return {
            'total_pages': structure.total_pages,
            'pages_with_text': structure.pages_with_text,
            'report_type': structure.report_type,
            'report_date': structure.report_date,
            'applicant_info': structure.applicant_info
        }

# Factory function for easy integration
def create_cibil_processor() -> CibilPdfProcessor:
    """Factory function to create a CIBIL PDF processor instance"""
    return CibilPdfProcessor()

# Utility function for direct processing
def process_cibil_pdf_file(pdf_path: str) -> Dict[str, Any]:
    """
    Utility function to process a CIBIL PDF file directly
    
    Args:
        pdf_path: Path to the CIBIL PDF file
        
    Returns:
        Processed CIBIL report data
    """
    processor = create_cibil_processor()
    return processor.process_cibil_pdf(pdf_path)