const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const excelService = require('../services/excelService');

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../data'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ storage: storage });

// Excel 处理控制器
class ExcelController {
  // 上传并分析 Excel 文件
  async uploadAndAnalyze(req, res) {
    try {
      // 使用 multer 中间件处理文件上传
      upload.single('file')(req, res, async function (err) {
        if (err) {
          return res.status(400).json({ error: 'File upload failed', details: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
          // 处理上传的文件
          const result = await excelService.processUploadedFile(req.file);
          res.status(200).json(result);
        } catch (error) {
          console.error('Error processing Excel file:', error);
          res.status(500).json({ error: 'Failed to process Excel file', details: error.message });
        }
      });
    } catch (error) {
      console.error('Error in uploadAndAnalyze:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 分析 Excel 数据（从请求体获取数据）
  async analyzeData(req, res) {
    try {
      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: 'No data provided' });
      }

      const analysis = excelService.analyzeExcelData(data);
      res.status(200).json({ analysis });
    } catch (error) {
      console.error('Error analyzing data:', error);
      res.status(500).json({ error: 'Failed to analyze data', details: error.message });
    }
  }

  // 导出数据到 Excel
  async exportToExcel(req, res) {
    try {
      const { data, fileName } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: 'No data provided' });
      }

      const exportFileName = fileName || `export_${Date.now()}.xlsx`;
      const filePath = await excelService.exportToExcel(data, exportFileName);
      
      res.status(200).json({ 
        message: 'Excel file exported successfully',
        filePath: filePath,
        fileName: exportFileName
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      res.status(500).json({ error: 'Failed to export to Excel', details: error.message });
    }
  }

  // 执行 SQL 查询
  async executeSQL(req, res) {
    try {
      const { data, sql } = req.body;
      
      if (!data || !sql) {
        return res.status(400).json({ error: 'Data and SQL are required' });
      }

      const result = await excelService.executeSQL(data, sql);
      res.status(200).json({ result });
    } catch (error) {
      console.error('Error executing SQL:', error);
      res.status(500).json({ error: 'Failed to execute SQL', details: error.message });
    }
  }

  // 执行高级查询
  async advancedQuery(req, res) {
    try {
      const { data, options } = req.body;
      
      if (!data || !options) {
        return res.status(400).json({ error: 'Data and options are required' });
      }

      const result = await excelService.query(data, options);
      res.status(200).json({ result });
    } catch (error) {
      console.error('Error executing advanced query:', error);
      res.status(500).json({ error: 'Failed to execute advanced query', details: error.message });
    }
  }
}

module.exports = new ExcelController();