const express = require('express');
const pool = require('../db');
const {
  generateWillDraft,
  getEstateAdvice,
  generatePOA,
  generateTrustPlan,
  generateHealthcareDirective,
  enhanceLegacyMessage,
  analyzeDigitalAssets,
  generateEstateSummary
} = require('../services/openrouter');

const router = express.Router();

// AI Will Drafting
router.post('/will-draft', async (req, res) => {
  try {
    const result = await generateWillDraft(req.body);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'will_draft', JSON.stringify(req.body), result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Estate Advice
router.post('/estate-advice', async (req, res) => {
  try {
    const result = await getEstateAdvice(req.body.question);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'estate_advice', req.body.question, result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI POA Generation
router.post('/generate-poa', async (req, res) => {
  try {
    const result = await generatePOA(req.body);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'poa_generation', JSON.stringify(req.body), result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Trust Planning
router.post('/trust-plan', async (req, res) => {
  try {
    const result = await generateTrustPlan(req.body);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'trust_plan', JSON.stringify(req.body), result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Healthcare Directive
router.post('/healthcare-directive', async (req, res) => {
  try {
    const result = await generateHealthcareDirective(req.body);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'healthcare_directive', JSON.stringify(req.body), result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Legacy Message Enhancement
router.post('/enhance-message', async (req, res) => {
  try {
    const result = await enhanceLegacyMessage(req.body);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'legacy_message', JSON.stringify(req.body), result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Digital Asset Analysis
router.post('/analyze-assets', async (req, res) => {
  try {
    const assets = await pool.query(
      'SELECT asset_name, asset_type, platform, value_estimate, status FROM digital_assets WHERE user_id = $1',
      [req.user.id]
    );
    const result = await analyzeDigitalAssets(assets.rows);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'asset_analysis', 'Analyze digital assets portfolio', result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Estate Summary
router.post('/estate-summary', async (req, res) => {
  try {
    const [wills, assets, beneficiaries, properties, policies, trusts] = await Promise.all([
      pool.query('SELECT title, status FROM wills WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT asset_name, asset_type, value_estimate FROM digital_assets WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT full_name, relationship, share_percentage FROM beneficiaries WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT property_name, estimated_value FROM properties WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT policy_name, coverage_amount FROM insurance_policies WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT trust_name, trust_type, status FROM trusts WHERE user_id = $1', [req.user.id]),
    ]);

    const data = {
      wills: wills.rows,
      digital_assets: assets.rows,
      beneficiaries: beneficiaries.rows,
      properties: properties.rows,
      insurance_policies: policies.rows,
      trusts: trusts.rows,
    };

    const result = await generateEstateSummary(data);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'estate_summary', 'Generate estate summary', result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get AI Chat History
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ai_chat_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
