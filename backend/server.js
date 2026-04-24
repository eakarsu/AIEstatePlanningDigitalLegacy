const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { authenticateToken } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const dashboardRoutes = require('./routes/dashboard');
const createCrudRouter = require('./routes/crud');

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Public routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Protected routes
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);

// CRUD routes
app.use('/api/wills', authenticateToken, createCrudRouter('wills', [
  'title', 'testator_name', 'status', 'content', 'ai_suggestions', 'executor_name', 'witness_1', 'witness_2'
]));
app.use('/api/digital-assets', authenticateToken, createCrudRouter('digital_assets', [
  'asset_name', 'asset_type', 'platform', 'value_estimate', 'access_info', 'beneficiary', 'notes', 'status'
]));
app.use('/api/beneficiaries', authenticateToken, createCrudRouter('beneficiaries', [
  'full_name', 'relationship', 'email', 'phone', 'address', 'share_percentage', 'notes', 'status'
]));
app.use('/api/notifications', authenticateToken, createCrudRouter('notifications', [
  'beneficiary_id', 'notification_type', 'subject', 'message', 'trigger_event', 'status', 'scheduled_date', 'sent_date'
]));
app.use('/api/documents', authenticateToken, createCrudRouter('documents', [
  'title', 'document_type', 'description', 'file_path', 'file_size', 'is_encrypted', 'tags', 'status'
]));
app.use('/api/power-of-attorney', authenticateToken, createCrudRouter('power_of_attorney', [
  'title', 'poa_type', 'principal_name', 'agent_name', 'powers_granted', 'ai_content', 'effective_date', 'expiration_date', 'status'
]));
app.use('/api/trusts', authenticateToken, createCrudRouter('trusts', [
  'trust_name', 'trust_type', 'grantor_name', 'trustee_name', 'beneficiary_names', 'assets_description', 'ai_recommendations', 'status'
]));
app.use('/api/healthcare-directives', authenticateToken, createCrudRouter('healthcare_directives', [
  'title', 'directive_type', 'principal_name', 'healthcare_agent', 'wishes', 'ai_content', 'conditions', 'status'
]));
app.use('/api/insurance-policies', authenticateToken, createCrudRouter('insurance_policies', [
  'policy_name', 'policy_type', 'provider', 'policy_number', 'coverage_amount', 'premium_amount', 'beneficiary', 'start_date', 'end_date', 'status'
]));
app.use('/api/properties', authenticateToken, createCrudRouter('properties', [
  'property_name', 'property_type', 'address', 'estimated_value', 'mortgage_balance', 'ownership_type', 'beneficiary', 'notes', 'status'
]));
app.use('/api/legacy-messages', authenticateToken, createCrudRouter('legacy_messages', [
  'title', 'recipient_name', 'recipient_email', 'message_content', 'ai_enhanced_content', 'delivery_trigger', 'delivery_date', 'status'
]));
app.use('/api/estate-timeline', authenticateToken, createCrudRouter('estate_timeline', [
  'title', 'description', 'milestone_type', 'due_date', 'completed_date', 'priority', 'status'
]));
app.use('/api/executor-tasks', authenticateToken, createCrudRouter('executor_tasks', [
  'title', 'description', 'assigned_to', 'category', 'priority', 'due_date', 'completed_date', 'status'
]));
app.use('/api/digital-accounts', authenticateToken, createCrudRouter('digital_accounts', [
  'account_name', 'account_type', 'platform', 'username', 'email_associated', 'action_on_death', 'designated_contact', 'notes', 'status'
]));

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
