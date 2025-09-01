import * as csv from 'fast-csv';

export interface CsvRow {
  [key: string]: string | number | null;
}

export interface ParsedCsvData {
  headers: string[];
  rows: CsvRow[];
  totalRows: number;
  validRows: number;
  errors: string[];
}

export async function parseCSV(buffer: Buffer): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const results: CsvRow[] = [];
    const errors: string[] = [];
    let headers: string[] = [];
    let rowIndex = 0;

    csv
      .parseString(buffer.toString(), {
        headers: true,
        trim: true,
        maxRows: 10000, // Limit to prevent memory issues
      })
      .on('headers', (headerList: string[]) => {
        headers = headerList;

        // Validate headers
        if (headers.length === 0) {
          reject(new Error('CSV file must contain headers'));
          return;
        }

        // Check for duplicate headers
        const duplicateHeaders = headers.filter(
          (header, index) => headers.indexOf(header) !== index,
        );

        if (duplicateHeaders.length > 0) {
          reject(new Error(`Duplicate headers found: ${duplicateHeaders.join(', ')}`));
          return;
        }
      })
      .on('data', (row: Record<string, unknown>) => {
        rowIndex++;

        try {
          // Validate row data
          const validatedRow = validateRow(row, headers);
          if (validatedRow) {
            results.push(validatedRow);
          }
        } catch (error) {
          errors.push(
            `Row ${rowIndex}: ${error instanceof Error ? error.message : 'Invalid data'}`,
          );
        }
      })
      .on('error', (error: Error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      })
      .on('end', () => {
        if (results.length === 0) {
          reject(new Error('No valid rows found in CSV file'));
          return;
        }

        if (errors.length > 0 && errors.length > results.length * 0.5) {
          reject(new Error(`Too many errors in CSV file: ${errors.slice(0, 5).join('; ')}`));
          return;
        }

        resolve(results);
      });
  });
}

function validateRow(row: Record<string, unknown>, headers: string[]): CsvRow | null {
  const validatedRow: CsvRow = {};
  let hasValidData = false;

  for (const header of headers) {
    const value = row[header];

    if (value !== undefined && value !== null && value !== '') {
      // Clean and validate the value
      const cleanValue = typeof value === 'string' ? value.trim() : value;

      if (cleanValue !== '') {
        validatedRow[header] =
          typeof cleanValue === 'string' || typeof cleanValue === 'number'
            ? cleanValue
            : String(cleanValue);
        hasValidData = true;
      } else {
        validatedRow[header] = null;
      }
    } else {
      validatedRow[header] = null;
    }
  }

  // Skip rows that are completely empty
  if (!hasValidData) {
    return null;
  }

  return validatedRow;
}

export function validateCsvStructure(data: CsvRow[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (data.length === 0) {
    errors.push('No data rows found');
    return { isValid: false, errors, warnings };
  }

  // Get headers from first row
  const headers = Object.keys(data[0]);

  if (headers.length === 0) {
    errors.push('No columns found');
    return { isValid: false, errors, warnings };
  }

  // Check for consistent structure across all rows
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowHeaders = Object.keys(row);

    if (rowHeaders.length !== headers.length) {
      warnings.push(`Row ${i + 1} has ${rowHeaders.length} columns, expected ${headers.length}`);
    }
  }

  // Check for completely empty columns
  for (const header of headers) {
    const hasData = data.some((row) => row[header] !== null && row[header] !== '');
    if (!hasData) {
      warnings.push(`Column "${header}" appears to be empty`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
