/**
 * SchemaSense - Multi-Format File Upload & Schema Extraction Controller
 * Parses Excel (.xlsx, .xls), Images (OCR & Schema Recognition), CSV, JSON, and SQL files,
 * extracting relational schemas, datatypes, candidate keys, and foreign keys for smell detection.
 */

class FileUploadParser {
    constructor(app) {
        this.app = app;
        this.currentExtractedDDL = '';
        this.currentFileType = null;
        this.currentFileName = '';
        this.initEvents();
    }

    initEvents() {
        const dropZone = document.getElementById('file-drop-zone');
        const fileInput = document.getElementById('file-upload-input');
        const btnBrowse = document.getElementById('btn-browse-file');

        if (dropZone && fileInput) {
            dropZone.onclick = (e) => {
                if (e.target !== btnBrowse) {
                    fileInput.click();
                }
            };
        }

        if (btnBrowse && fileInput) {
            btnBrowse.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInput.click();
            };
        }

        if (fileInput) {
            fileInput.onchange = (e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                    this.handleFile(files[0]);
                }
            };
        }

        if (dropZone) {
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.classList.add('drop-zone-active');
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.classList.remove('drop-zone-active');
                }, false);
            });

            dropZone.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                const files = dt.files;
                if (files && files.length > 0) {
                    this.handleFile(files[0]);
                }
            }, false);
        }

        // Action button to analyze extracted DDL
        const btnAnalyzeExtracted = document.getElementById('btn-analyze-extracted-schema');
        if (btnAnalyzeExtracted) {
            btnAnalyzeExtracted.onclick = () => {
                const ddlText = document.getElementById('extracted-ddl-editor').value;
                if (!ddlText || !ddlText.trim()) {
                    alert('No SQL DDL to analyze.');
                    return;
                }
                const sqlInput = document.getElementById('sql-input');
                if (sqlInput) sqlInput.value = ddlText;

                // Switch to SQL tab and run analysis
                const sqlTabBtn = document.querySelector('.input-tab-btn[data-pane="pane-sql"]');
                if (sqlTabBtn) sqlTabBtn.click();

                if (this.app) {
                    this.app.runAnalysis();
                }
            };
        }

        // Sample File Loader Buttons
        const btnSampleExcel = document.getElementById('btn-load-sample-excel');
        const btnSampleImage = document.getElementById('btn-load-sample-image');
        const btnSampleCsv = document.getElementById('btn-load-sample-csv');
        const btnSampleJson = document.getElementById('btn-load-sample-json');

        if (btnSampleExcel) btnSampleExcel.onclick = () => this.loadSamplePreset('excel');
        if (btnSampleImage) btnSampleImage.onclick = () => this.loadSamplePreset('image');
        if (btnSampleCsv) btnSampleCsv.onclick = () => this.loadSamplePreset('csv');
        if (btnSampleJson) btnSampleJson.onclick = () => this.loadSamplePreset('json');
    }

    async handleFile(file) {
        this.currentFileName = file.name;
        const nameLower = file.name.toLowerCase();

        this.showProgress(`Processing ${file.name}...`);

        try {
            if (nameLower.endsWith('.xlsx') || nameLower.endsWith('.xls')) {
                this.currentFileType = 'excel';
                await this.processExcelFile(file);
            } else if (nameLower.endsWith('.csv')) {
                this.currentFileType = 'csv';
                await this.processCsvFile(file);
            } else if (nameLower.endsWith('.json')) {
                this.currentFileType = 'json';
                await this.processJsonFile(file);
            } else if (nameLower.endsWith('.sql')) {
                this.currentFileType = 'sql';
                await this.processSqlFile(file);
            } else if (nameLower.match(/\.(png|jpg|jpeg|webp|bmp)$/)) {
                this.currentFileType = 'image';
                await this.processImageFile(file);
            } else {
                alert(`Unsupported file format: ${file.name}. Please upload Excel (.xlsx, .xls), Image (.png, .jpg), CSV, JSON, or SQL.`);
                this.hideProgress();
            }
        } catch (err) {
            console.error('File processing error:', err);
            this.showError(`Error processing ${file.name}: ${err.message}`);
        }
    }

    /* ==========================================================================
       1. EXCEL (.XLSX / .XLS) PARSING
       ========================================================================== */
    async processExcelFile(file) {
        const arrayBuffer = await file.arrayBuffer();

        if (typeof XLSX === 'undefined') {
            // Try backend upload fallback
            await this.uploadToBackend(file);
            return;
        }

        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const tables = [];

        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (!rawData || rawData.length === 0) return;

            // Check if Data Dictionary format (headers contain table, column, datatype)
            const headers = (rawData[0] || []).map(h => String(h || '').trim());
            const isDataDictionary = this.checkIfDataDictionary(headers);

            if (isDataDictionary) {
                const dictTables = this.parseDataDictionaryRows(rawData);
                tables.push(...dictTables);
            } else {
                const table = this.inferTableFromDataRows(sheetName, rawData);
                if (table) tables.push(table);
            }
        });

        if (tables.length === 0) {
            throw new Error('No valid tabular data or data dictionary found in Excel workbook.');
        }

        // Infer logical foreign keys between tables based on column naming
        this.inferForeignKeysAcrossTables(tables);

        const ddl = this.generateDDLFromTables(tables);
        this.displayExtractionResult({
            fileName: file.name,
            fileType: 'Microsoft Excel Spreadsheet (.xlsx)',
            tables,
            ddl,
            previewRows: null
        });
    }

    checkIfDataDictionary(headers) {
        const lower = headers.map(h => h.toLowerCase());
        const hasCol = lower.some(h => h.includes('column') || h.includes('attribute') || h.includes('field'));
        const hasType = lower.some(h => h.includes('type') || h.includes('data type') || h.includes('datatype'));
        return hasCol && hasType;
    }

    parseDataDictionaryRows(rows) {
        const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
        const colIdxTable = headers.findIndex(h => h.includes('table') || h.includes('entity'));
        const colIdxName = headers.findIndex(h => h.includes('column') || h.includes('attribute') || h.includes('field'));
        const colIdxType = headers.findIndex(h => h.includes('type'));
        const colIdxPK = headers.findIndex(h => h.includes('pk') || h.includes('primary'));
        const colIdxFK = headers.findIndex(h => h.includes('fk') || h.includes('foreign'));
        const colIdxNull = headers.findIndex(h => h.includes('null'));

        const tablesMap = {};

        for (let r = 1; r < rows.length; r++) {
            const row = rows[r];
            if (!row || row.length === 0) continue;

            const tableName = (colIdxTable >= 0 && row[colIdxTable]) ? String(row[colIdxTable]).trim() : 'Table1';
            const colName = (colIdxName >= 0 && row[colIdxName]) ? String(row[colIdxName]).trim() : `col_${r}`;
            const colType = (colIdxType >= 0 && row[colIdxType]) ? String(row[colIdxType]).trim().toUpperCase() : 'VARCHAR(255)';

            const isPK = colIdxPK >= 0 && Boolean(String(row[colIdxPK]).match(/yes|true|1|pk/i));
            const isFK = colIdxFK >= 0 && Boolean(String(row[colIdxFK]).match(/yes|true|1|fk/i));
            const isNullable = colIdxNull >= 0 ? !Boolean(String(row[colIdxNull]).match(/no|false|not null/i)) : !isPK;

            if (!tablesMap[tableName]) {
                tablesMap[tableName] = {
                    name: this.sanitizeIdentifier(tableName),
                    columns: [],
                    primaryKey: [],
                    foreignKeys: []
                };
            }

            tablesMap[tableName].columns.push({
                name: this.sanitizeIdentifier(colName),
                type: colType,
                isPrimaryKey: isPK,
                isForeignKey: isFK,
                isNullable
            });

            if (isPK) {
                tablesMap[tableName].primaryKey.push(this.sanitizeIdentifier(colName));
            }
        }

        return Object.values(tablesMap);
    }

    inferTableFromDataRows(sheetName, rawData) {
        if (rawData.length < 1) return null;

        const headers = rawData[0].map((h, i) => {
            const val = String(h || '').trim();
            return val ? this.sanitizeIdentifier(val) : `col_${i + 1}`;
        });

        const dataRows = rawData.slice(1).filter(r => r && r.length > 0 && r.some(v => v !== null && v !== undefined && String(v).trim() !== ''));

        const columns = [];
        let candidatePK = null;

        headers.forEach((colName, colIdx) => {
            const colValues = dataRows.map(r => r[colIdx]).filter(v => v !== null && v !== undefined && String(v).trim() !== '');

            // Type inference
            const type = this.inferDataType(colValues);

            // Nullability check
            const hasNulls = colValues.length < dataRows.length;

            // Uniqueness check
            const uniqueVals = new Set(colValues.map(v => String(v).toLowerCase()));
            const isUnique = colValues.length > 0 && uniqueVals.size === colValues.length && !hasNulls;

            // Pick first unique column as PK candidate, especially if named id or ends with _id
            const isIdNamed = colName.toLowerCase() === 'id' || colName.toLowerCase().endsWith('_id') || colName.toLowerCase().endsWith('id');
            let isPK = false;

            if (isUnique && !candidatePK) {
                if (isIdNamed || colIdx === 0) {
                    isPK = true;
                    candidatePK = colName;
                }
            }

            columns.push({
                name: colName,
                type,
                isPrimaryKey: isPK,
                isForeignKey: false,
                isNullable: !isPK && hasNulls,
                sampleValues: colValues.slice(0, 3)
            });
        });

        // Fallback: if no unique ID found but first column has no nulls and reasonable uniqueness
        if (!candidatePK && columns.length > 0) {
            const firstCol = columns[0];
            const isIdLike = firstCol.name.toLowerCase().includes('id');
            if (isIdLike) {
                firstCol.isPrimaryKey = true;
                candidatePK = firstCol.name;
            }
        }

        return {
            name: this.sanitizeIdentifier(sheetName),
            columns,
            primaryKey: candidatePK ? [candidatePK] : [],
            foreignKeys: [],
            rowCount: dataRows.length,
            sampleRows: dataRows.slice(0, 5)
        };
    }

    inferDataType(values) {
        if (!values || values.length === 0) return 'VARCHAR(255)';

        let integerCount = 0;
        let floatCount = 0;
        let dateCount = 0;
        let boolCount = 0;

        for (const val of values) {
            const str = String(val).trim();

            if (str.match(/^(true|false|1|0)$/i) && values.length > 2 && values.every(v => String(v).match(/^(true|false|1|0)$/i))) {
                boolCount++;
            } else if (str.match(/^-?\d+$/)) {
                integerCount++;
            } else if (str.match(/^-?\d+\.\d+$/)) {
                floatCount++;
            } else if (str.match(/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/) || !isNaN(Date.parse(str)) && str.includes('-')) {
                dateCount++;
            }
        }

        const len = values.length;
        if (integerCount === len) return 'INT';
        if (integerCount + floatCount === len) return 'DECIMAL(10,2)';
        if (dateCount === len) return 'DATE';
        if (boolCount === len) return 'BOOLEAN';

        // Check maximum string length
        const maxLen = Math.max(...values.map(v => String(v).length));
        if (maxLen > 255) return 'TEXT';
        if (maxLen <= 50) return 'VARCHAR(50)';
        return 'VARCHAR(255)';
    }

    inferForeignKeysAcrossTables(tables) {
        tables.forEach(table => {
            table.columns.forEach(col => {
                const colName = col.name.toLowerCase();
                if (colName.endsWith('_id') || colName.endsWith('id')) {
                    // Check other tables
                    tables.forEach(otherTable => {
                        if (otherTable.name.toLowerCase() !== table.name.toLowerCase()) {
                            const matchCol = otherTable.columns.find(c => c.name.toLowerCase() === colName || (c.isPrimaryKey && otherTable.name.toLowerCase() + '_id' === colName));
                            if (matchCol && otherTable.primaryKey.includes(matchCol.name)) {
                                col.isForeignKey = true;
                                col.references = { table: otherTable.name, column: matchCol.name };
                                table.foreignKeys.push({
                                    fromColumns: [col.name],
                                    toTable: otherTable.name,
                                    toColumns: [matchCol.name]
                                });
                            }
                        }
                    });
                }
            });
        });
    }

    /* ==========================================================================
       2. CSV (.CSV) PARSING
       ========================================================================== */
    async processCsvFile(file) {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

        if (lines.length === 0) {
            throw new Error('CSV file is empty.');
        }

        const parseCsvLine = (line) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"' || char === "'") {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim().replace(/^["']|["']$/g, ''));
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim().replace(/^["']|["']$/g, ''));
            return result;
        };

        const rawRows = lines.map(parseCsvLine);
        const tableName = this.sanitizeIdentifier(file.name.replace(/\.csv$/i, ''));
        const table = this.inferTableFromDataRows(tableName, rawRows);

        if (!table) throw new Error('Could not parse tabular columns from CSV.');

        const tables = [table];
        const ddl = this.generateDDLFromTables(tables);

        this.displayExtractionResult({
            fileName: file.name,
            fileType: 'Comma-Separated Values (.csv)',
            tables,
            ddl,
            previewRows: table.sampleRows
        });
    }

    /* ==========================================================================
       3. JSON (.JSON) PARSING
       ========================================================================== */
    async processJsonFile(file) {
        const text = await file.text();
        const data = JSON.parse(text);

        const tables = [];
        const baseName = this.sanitizeIdentifier(file.name.replace(/\.json$/i, ''));

        if (Array.isArray(data)) {
            // Array of records
            const rawRows = [];
            const allKeys = new Set();
            data.slice(0, 100).forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    Object.keys(item).forEach(k => allKeys.add(k));
                }
            });

            const headerArray = Array.from(allKeys);
            rawRows.push(headerArray);

            data.slice(0, 50).forEach(item => {
                const row = headerArray.map(k => {
                    const val = item[k];
                    if (Array.isArray(val)) {
                        return val.join(', '); // multivalued
                    }
                    if (typeof val === 'object' && val !== null) {
                        return JSON.stringify(val);
                    }
                    return val;
                });
                rawRows.push(row);
            });

            const table = this.inferTableFromDataRows(baseName, rawRows);
            if (table) tables.push(table);
        } else if (typeof data === 'object' && data !== null) {
            // Object containing tables as keys
            Object.keys(data).forEach(key => {
                const sub = data[key];
                if (Array.isArray(sub) && sub.length > 0 && typeof sub[0] === 'object') {
                    const allKeys = Object.keys(sub[0]);
                    const rawRows = [allKeys];
                    sub.slice(0, 50).forEach(item => {
                        rawRows.push(allKeys.map(k => item[k]));
                    });
                    const table = this.inferTableFromDataRows(key, rawRows);
                    if (table) tables.push(table);
                }
            });

            if (tables.length === 0) {
                // Single object table
                const keys = Object.keys(data);
                const rawRows = [keys, keys.map(k => data[k])];
                const table = this.inferTableFromDataRows(baseName, rawRows);
                if (table) tables.push(table);
            }
        }

        const ddl = this.generateDDLFromTables(tables);
        this.displayExtractionResult({
            fileName: file.name,
            fileType: 'JSON Document Data (.json)',
            tables,
            ddl,
            previewRows: null
        });
    }

    /* ==========================================================================
       4. SQL (.SQL) DDL FILE
       ========================================================================== */
    async processSqlFile(file) {
        const text = await file.text();
        this.displayExtractionResult({
            fileName: file.name,
            fileType: 'SQL DDL Script (.sql)',
            tables: null,
            ddl: text,
            previewRows: null
        });
    }

    /* ==========================================================================
       5. IMAGE (.PNG, .JPG, .JPEG) OCR & SCHEMA RECOGNITION
       ========================================================================== */
    async processImageFile(file) {
        const imgUrl = URL.createObjectURL(file);

        // Show image preview container
        const imgPreviewContainer = document.getElementById('extracted-image-preview-container');
        const imgEl = document.getElementById('extracted-image-preview');
        if (imgPreviewContainer && imgEl) {
            imgPreviewContainer.style.display = 'block';
            imgEl.src = imgUrl;
        }

        this.showProgress('Analyzing image and recognizing database schema via OCR...');

        let extractedText = '';

        if (typeof Tesseract !== 'undefined') {
            try {
                const res = await Tesseract.recognize(file, 'eng', {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            this.showProgress(`OCR in progress: ${Math.round(m.progress * 100)}%`);
                        }
                    }
                });
                extractedText = res.data.text;
            } catch (tessErr) {
                console.warn('Client-side Tesseract failed, attempting backend fallback:', tessErr);
            }
        }

        if (!extractedText || !extractedText.trim()) {
            // Attempt server-side image upload
            try {
                const backendRes = await this.uploadToBackend(file);
                if (backendRes && backendRes.ddl) {
                    this.displayExtractionResult({
                        fileName: file.name,
                        fileType: 'Schema Diagram / Image OCR',
                        tables: backendRes.tables || [],
                        ddl: backendRes.ddl,
                        previewRows: null
                    });
                    return;
                }
            } catch (backendErr) {
                console.error('Backend image parse failed:', backendErr);
            }
        }

        // Parse extracted text for Relational Schema or SQL statements
        const ddl = this.extractSchemaFromOcrText(extractedText, file.name);

        this.displayExtractionResult({
            fileName: file.name,
            fileType: 'Schema Diagram / Image OCR',
            tables: [],
            ddl: ddl,
            previewRows: null,
            ocrText: extractedText
        });
    }

    extractSchemaFromOcrText(ocrText, fileName) {
        if (!ocrText || !ocrText.trim()) {
            return `-- OCR detected no text in image. You can specify DDL below:
CREATE TABLE SampleEntity (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);`;
        }

        const lines = ocrText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        // 1. Check if lines contain SQL CREATE TABLE
        const sqlMatch = ocrText.match(/CREATE\s+TABLE[\s\S]+?;/i);
        if (sqlMatch) {
            return sqlMatch[0];
        }

        // 2. Parse Relational Schema Notation: e.g. Student(student_id, name, dept_id)
        // or Student (student_id INT PK, student_name VARCHAR, ...)
        const tables = [];
        let currentTable = null;

        const tableRegex = /^([A-Za-z0-9_]+)\s*\((.+)\)$/;

        for (const line of lines) {
            const relMatch = line.match(tableRegex);
            if (relMatch) {
                const tName = relMatch[1];
                const colsRaw = relMatch[2].split(',');
                const columns = [];
                const pks = [];

                colsRaw.forEach(c => {
                    const parts = c.trim().split(/\s+/);
                    const cName = parts[0];
                    let cType = parts.length > 1 ? parts[1].toUpperCase() : 'VARCHAR(255)';
                    if (!cType.match(/^(INT|INTEGER|VARCHAR|TEXT|DATE|DECIMAL|FLOAT|BOOLEAN)/)) {
                        cType = 'VARCHAR(255)';
                    }
                    const isPK = c.toLowerCase().includes('pk') || c.toLowerCase().includes('primary');
                    if (isPK) pks.push(cName);

                    columns.push({
                        name: cName,
                        type: cType,
                        isPrimaryKey: isPK,
                        isNullable: !isPK
                    });
                });

                tables.push({
                    name: tName,
                    columns,
                    primaryKey: pks,
                    foreignKeys: []
                });
            } else if (line.match(/^Table:\s*([A-Za-z0-9_]+)/i)) {
                const match = line.match(/^Table:\s*([A-Za-z0-9_]+)/i);
                currentTable = {
                    name: match[1],
                    columns: [],
                    primaryKey: [],
                    foreignKeys: []
                };
                tables.push(currentTable);
            } else if (currentTable && line.match(/^[-*•]\s*([A-Za-z0-9_]+)/)) {
                const match = line.match(/^[-*•]\s*([A-Za-z0-9_]+)(?:\s*\(([^)]+)\))?/);
                const colName = match[1];
                const meta = match[2] || '';
                const isPK = meta.toLowerCase().includes('pk');
                if (isPK) currentTable.primaryKey.push(colName);
                currentTable.columns.push({
                    name: colName,
                    type: meta.includes('INT') ? 'INT' : 'VARCHAR(255)',
                    isPrimaryKey: isPK,
                    isNullable: !isPK
                });
            }
        }

        if (tables.length > 0) {
            return this.generateDDLFromTables(tables);
        }

        // Fallback: construct schema from detected words
        const defaultTableName = this.sanitizeIdentifier(fileName.replace(/\.[^.]+$/, '')) || 'DetectedSchema';
        let ddl = `-- Extracted text from image:
/*
${ocrText}
*/

`;
        ddl += `CREATE TABLE ${defaultTableName} (
`;

        const words = lines.flatMap(l => l.split(/[^A-Za-z0-9_]+/)).filter(w => w.length > 1 && !w.match(/^\d+$/));
        const uniqueAttrs = Array.from(new Set(words)).slice(0, 8);

        if (uniqueAttrs.length > 0) {
            ddl += `    ${uniqueAttrs[0]} INT PRIMARY KEY,
`;
            for (let i = 1; i < uniqueAttrs.length; i++) {
                const isLast = i === uniqueAttrs.length - 1;
                ddl += `    ${uniqueAttrs[i]} VARCHAR(255)${isLast ? '' : ','}
`;
            }
        } else {
            ddl += `    id INT PRIMARY KEY,
    name VARCHAR(255)
`;
        }
        ddl += `);`;

        return ddl;
    }

    /* ==========================================================================
       6. BACKEND FALLBACK API (FLASK /api/upload-parse)
       ========================================================================== */
    async uploadToBackend(file) {
        const formData = new FormData();
        formData.append('file', file);

        const resp = await fetch('/api/upload-parse', {
            method: 'POST',
            body: formData
        });

        if (!resp.ok) {
            const errJson = await resp.json().catch(() => ({}));
            throw new Error(errJson.message || `Server returned error ${resp.status}`);
        }

        return await resp.json();
    }

    /* ==========================================================================
       7. DDL CODE GENERATION FROM EXTRACTED OBJECTS
       ========================================================================== */
    generateDDLFromTables(tables) {
        let ddl = `-- SchemaSense Inferred Relational Schema
-- Source: ${this.currentFileName || 'Uploaded File'}
-- Generated: ${new Date().toISOString()}

`;

        tables.forEach(table => {
            ddl += `CREATE TABLE ${table.name} (
`;
            const colDefs = table.columns.map(col => {
                let def = `    ${col.name} ${col.type}`;
                if (col.isPrimaryKey && table.primaryKey.length === 1) {
                    def += ' PRIMARY KEY';
                } else if (!col.isNullable) {
                    def += ' NOT NULL';
                }
                return def;
            });

            // Composite Primary Key constraint
            if (table.primaryKey.length > 1) {
                colDefs.push(`    PRIMARY KEY (${table.primaryKey.join(', ')})`);
            }

            // Foreign Key constraints
            if (table.foreignKeys && table.foreignKeys.length > 0) {
                table.foreignKeys.forEach(fk => {
                    colDefs.push(`    FOREIGN KEY (${fk.fromColumns.join(', ')}) REFERENCES ${fk.toTable}(${fk.toColumns.join(', ')})`);
                });
            }

            ddl += colDefs.join(',\n') + '\n);\n\n';
        });

        return ddl.trim();
    }

    /* ==========================================================================
       8. UI RENDERING & PREVIEWS
       ========================================================================== */
    displayExtractionResult({ fileName, fileType, tables, ddl, previewRows, ocrText }) {
        this.hideProgress();
        this.currentExtractedDDL = ddl;

        const resultContainer = document.getElementById('extracted-schema-result-card');
        const nameBadge = document.getElementById('extracted-file-name-badge');
        const typeBadge = document.getElementById('extracted-file-type-badge');
        const ddlEditor = document.getElementById('extracted-ddl-editor');
        const tablesBadge = document.getElementById('extracted-tables-count-badge');
        const ocrBox = document.getElementById('extracted-ocr-raw-box');

        if (resultContainer) resultContainer.style.display = 'block';
        if (nameBadge) nameBadge.textContent = fileName;
        if (typeBadge) typeBadge.textContent = fileType;
        if (ddlEditor) ddlEditor.value = ddl;
        const sqlInput = document.getElementById('sql-input');
        if (sqlInput) sqlInput.value = ddl;

        if (tablesBadge && tables) {
            tablesBadge.textContent = `${tables.length} Table${tables.length === 1 ? '' : 's'} Extracted`;
        }

        if (ocrBox) {
            if (ocrText) {
                ocrBox.style.display = 'block';
                ocrBox.textContent = `Raw OCR Output:\n${ocrText}`;
            } else {
                ocrBox.style.display = 'none';
            }
        }

        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }

    showProgress(msg) {
        const progBox = document.getElementById('file-upload-progress-box');
        const progText = document.getElementById('file-upload-progress-text');
        if (progBox) progBox.style.display = 'block';
        if (progText) progText.textContent = msg;

        const errBox = document.getElementById('file-upload-error-box');
        if (errBox) errBox.style.display = 'none';
    }

    hideProgress() {
        const progBox = document.getElementById('file-upload-progress-box');
        if (progBox) progBox.style.display = 'none';
    }

    showError(msg) {
        this.hideProgress();
        const errBox = document.getElementById('file-upload-error-box');
        if (errBox) {
            errBox.style.display = 'block';
            errBox.innerHTML = `<strong>⚠️ Upload Error:</strong> ${msg}`;
        }
    }

    sanitizeIdentifier(str) {
        return str.replace(/[^A-Za-z0-9_]/g, '_').replace(/^_+|_+$/g, '') || 'Item';
    }

    /* ==========================================================================
       9. SAMPLE PRESETS (1-CLICK DEMOS)
       ========================================================================== */
    loadSamplePreset(type) {
        if (type === 'excel') {
            // Simulated multi-table Excel with 1NF and 2NF smells
            const tables = [
                {
                    name: 'StudentEnrollment',
                    columns: [
                        { name: 'student_id', type: 'INT', isPrimaryKey: true, isNullable: false },
                        { name: 'course_id', type: 'INT', isPrimaryKey: true, isNullable: false },
                        { name: 'student_name', type: 'VARCHAR(100)', isPrimaryKey: false, isNullable: false },
                        { name: 'department_name', type: 'VARCHAR(100)', isPrimaryKey: false, isNullable: true },
                        { name: 'phone_numbers', type: 'VARCHAR(255)', isPrimaryKey: false, isNullable: true },
                        { name: 'grade', type: 'VARCHAR(2)', isPrimaryKey: false, isNullable: true }
                    ],
                    primaryKey: ['student_id', 'course_id'],
                    foreignKeys: []
                },
                {
                    name: 'CourseCatalog',
                    columns: [
                        { name: 'course_id', type: 'INT', isPrimaryKey: true, isNullable: false },
                        { name: 'course_title', type: 'VARCHAR(150)', isPrimaryKey: false, isNullable: false },
                        { name: 'credits', type: 'INT', isPrimaryKey: false, isNullable: false }
                    ],
                    primaryKey: ['course_id'],
                    foreignKeys: []
                }
            ];
            const ddl = this.generateDDLFromTables(tables);
            this.displayExtractionResult({
                fileName: 'University_Students_Courses.xlsx',
                fileType: 'Microsoft Excel Spreadsheet (Sample Preset)',
                tables,
                ddl,
                previewRows: null
            });
        } else if (type === 'csv') {
            const ddl = `-- Inferred from EmployeePayroll.csv\nCREATE TABLE EmployeePayroll (\n    emp_id INT PRIMARY KEY,\n    full_name VARCHAR(120) NOT NULL,\n    dept_id INT NOT NULL,\n    dept_name VARCHAR(100),\n    phone1 VARCHAR(20),\n    phone2 VARCHAR(20),\n    monthly_salary DECIMAL(10,2)\n);`;
            this.displayExtractionResult({
                fileName: 'EmployeePayroll.csv',
                fileType: 'Comma-Separated Values (Sample Preset)',
                tables: [{ name: 'EmployeePayroll' }],
                ddl,
                previewRows: null
            });
        } else if (type === 'json') {
            const ddl = `-- Inferred from ECommerceOrders.json (Document Model)\nCREATE TABLE CustomerOrders (\n    order_id INT PRIMARY KEY,\n    customer_id INT NOT NULL,\n    customer_email VARCHAR(255) NOT NULL,\n    order_date DATE NOT NULL,\n    order_items TEXT,\n    total_amount DECIMAL(10,2)\n);`;
            this.displayExtractionResult({
                fileName: 'ECommerceOrders.json',
                fileType: 'JSON Document Store (Sample Preset)',
                tables: [{ name: 'CustomerOrders' }],
                ddl,
                previewRows: null
            });
        } else if (type === 'image') {
            const ddl = `-- Schema extracted from Relational Schema Screenshot\nCREATE TABLE HospitalPatient (\n    patient_id INT PRIMARY KEY,\n    patient_name VARCHAR(100) NOT NULL,\n    contact_phones VARCHAR(255),\n    doctor_id INT,\n    doctor_name VARCHAR(100),\n    hospital_branch VARCHAR(100)\n);\n\nCREATE TABLE Doctor (\n    doctor_id INT PRIMARY KEY,\n    doctor_name VARCHAR(100) NOT NULL,\n    specialization VARCHAR(100)\n);`;
            this.displayExtractionResult({
                fileName: 'Hospital_ER_Schema_Diagram.png',
                fileType: 'Schema Diagram OCR (Sample Preset)',
                tables: [{ name: 'HospitalPatient' }, { name: 'Doctor' }],
                ddl,
                previewRows: null,
                ocrText: "HospitalPatient (patient_id PK, patient_name, contact_phones, doctor_id FK, doctor_name, hospital_branch)\nDoctor (doctor_id PK, doctor_name, specialization)"
            });
        }
    }
}

if (typeof window !== 'undefined') {
    window.FileUploadParser = FileUploadParser;
}
