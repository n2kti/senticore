import assert from 'node:assert/strict';
import { ACTION_PLANS, MOCK_CONTACT_HISTORY_BY_CUSTOMER, MOCK_CUSTOMERS, MOCK_PAYMENT_HISTORY_BY_CUSTOMER } from './constants';
import { buildGuidance, DEFAULT_MANUALS, DEFAULT_TONE_POLICIES } from './manuals';
import { buildActionChecklist, buildCustomerWorkSummary } from './operations';

const highRiskCustomer = MOCK_CUSTOMERS.find((customer) => customer.id === '1')!;
const highRiskGuidance = buildGuidance(
  DEFAULT_MANUALS,
  DEFAULT_TONE_POLICIES,
  highRiskCustomer,
  MOCK_PAYMENT_HISTORY_BY_CUSTOMER[highRiskCustomer.id],
  MOCK_CONTACT_HISTORY_BY_CUSTOMER[highRiskCustomer.id]
);

const highRiskSummary = buildCustomerWorkSummary(
  highRiskCustomer,
  MOCK_PAYMENT_HISTORY_BY_CUSTOMER[highRiskCustomer.id],
  MOCK_CONTACT_HISTORY_BY_CUSTOMER[highRiskCustomer.id],
  highRiskGuidance
);

assert.equal(highRiskSummary.priorityLevel, 'critical');
assert.equal(highRiskSummary.nextActionTitle, '법적 절차 전 최종 확인');
assert.ok(highRiskSummary.productFinding.includes('차량담보대출'));
assert.ok(highRiskSummary.productFinding.includes('고정'));
assert.ok(highRiskSummary.productDecision.includes('담보'));
assert.ok(highRiskSummary.behaviorFinding.includes('D+124'));
assert.ok(highRiskSummary.behaviorDecision.includes('고지'));
assert.ok(highRiskSummary.accountActions.some((action) => action.includes('기한이익상실')));
assert.ok(highRiskSummary.sentimentFinding.includes('18'));
assert.ok(highRiskSummary.sentimentDecision.includes('압박금지'));
assert.ok(highRiskSummary.personalMemo.includes('전화'));
assert.ok(highRiskSummary.reasons.some((reason) => reason.includes('D+124')));
assert.ok(highRiskSummary.complianceWarnings.some((warning) => warning.includes('확정')));

const highRiskChecklist = buildActionChecklist(highRiskCustomer, ACTION_PLANS, highRiskGuidance);
assert.equal(highRiskChecklist[0].required, true);
assert.ok(highRiskChecklist.some((item) => item.label.includes('기한이익상실')));
assert.ok(highRiskChecklist.some((item) => item.label.includes('상담 기록')));

const stableCustomer = MOCK_CUSTOMERS.find((customer) => customer.id === '2')!;
const stableGuidance = buildGuidance(
  DEFAULT_MANUALS,
  DEFAULT_TONE_POLICIES,
  stableCustomer,
  MOCK_PAYMENT_HISTORY_BY_CUSTOMER[stableCustomer.id],
  MOCK_CONTACT_HISTORY_BY_CUSTOMER[stableCustomer.id]
);

const stableSummary = buildCustomerWorkSummary(
  stableCustomer,
  MOCK_PAYMENT_HISTORY_BY_CUSTOMER[stableCustomer.id],
  MOCK_CONTACT_HISTORY_BY_CUSTOMER[stableCustomer.id],
  stableGuidance
);

assert.equal(stableSummary.priorityLevel, 'routine');
assert.equal(stableSummary.recommendedChannel, '감사 문자');
assert.ok(stableSummary.nextActionDetail.includes('관계 유지'));
assert.ok(stableSummary.productDecision.includes('보증'));

console.log('operations tests passed');
