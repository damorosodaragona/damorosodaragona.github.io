const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('.primary-nav');

if (navToggle && primaryNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    primaryNav.classList.toggle('is-open', !isOpen);
  });

  primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      primaryNav.classList.remove('is-open');
    });
  });
}

document.querySelectorAll('[data-current-year]').forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const filterButtons = document.querySelectorAll('[data-filter]');
const publicationEntries = document.querySelectorAll('[data-publication-type]');
const publicationGroups = document.querySelectorAll('[data-publication-group]');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });

    publicationEntries.forEach((entry) => {
      entry.hidden = filter !== 'all' && entry.dataset.publicationType !== filter;
    });

    publicationGroups.forEach((group) => {
      group.hidden = !group.querySelector('[data-publication-type]:not([hidden])');
    });
  });
});

const architectureTraining = [
  {
    label: 'Action 1 · Merge services',
    title: 'Two services behave like one.',
    brief: 'Checkout and Pricing were meant to evolve independently, but four recent changes touched both. That repeated pattern is the clue.',
    instruction: 'Select <strong>Checkout</strong>, then place it on <strong>Pricing</strong>. On a computer you can also drag one service onto the other.',
    when: 'Merge when most responsibilities move together and the separation creates coordination without real independence.',
    tradeoff: 'The coordination disappears, but the combined service is larger and has more responsibilities to understand.',
    result: 'The next release needs no cross-service coordination for these shared changes. The cost is one larger service boundary.',
    expected: { type: 'merge-service', pair: ['checkout', 'pricing'] },
    state: {
      services: [
        { id: 'checkout', name: 'Checkout', responsibilities: [{ id: 'cart', label: 'Cart', domain: 'purchase' }, { id: 'total', label: 'Order total', domain: 'purchase' }] },
        { id: 'pricing', name: 'Pricing', responsibilities: [{ id: 'discounts', label: 'Discounts', domain: 'purchase' }, { id: 'taxes', label: 'Taxes', domain: 'purchase' }] },
        { id: 'profile', name: 'Profile', responsibilities: [{ id: 'preferences', label: 'Preferences', domain: 'account' }] },
      ],
    },
    coChanges: [['cart', 'discounts', 4]],
    history: {
      type: 'history', title: 'Saved changes over time', note: 'A vertical line = one change touched several services',
      aria: 'Change history where Checkout and Pricing are changed together four times, while Profile changes separately.',
      lanes: [['checkout', 'Checkout'], ['pricing', 'Pricing'], ['profile', 'Profile']],
      commits: [['c1', 132, ['checkout']], ['c2', 190, ['checkout', 'pricing']], ['c3', 248, ['checkout', 'pricing']], ['c4', 306, ['profile']], ['c5', 364, ['checkout', 'pricing']], ['c6', 422, ['pricing']], ['c7', 480, ['checkout', 'pricing']]],
    },
  },
  {
    label: 'Action 2 · Move a responsibility',
    title: 'Only one responsibility is in the wrong place.',
    brief: 'Orders is mostly independent. Its “Receipt emails” responsibility is the exception: it keeps changing with the templates inside Notifications.',
    instruction: 'Select <strong>Receipt emails</strong>, then place it inside <strong>Notifications</strong>.',
    when: 'Move one responsibility when the coupling is localized. You can fix the boundary without merging two otherwise independent services.',
    tradeoff: 'The destination becomes slightly larger, so check that it still has one clear purpose.',
    result: 'Email-related work is now contained in Notifications. Orders keeps its own focused responsibilities instead of absorbing the whole service.',
    expected: { type: 'move-responsibility', sourceId: 'receipt-email', targetId: 'notifications' },
    state: {
      services: [
        { id: 'orders', name: 'Orders', responsibilities: [{ id: 'order-flow', label: 'Order flow', domain: 'orders' }, { id: 'order-store', label: 'Order storage', domain: 'orders' }, { id: 'receipt-email', label: 'Receipt emails', domain: 'notification' }] },
        { id: 'notifications', name: 'Notifications', responsibilities: [{ id: 'templates', label: 'Email templates', domain: 'notification' }, { id: 'delivery', label: 'Message delivery', domain: 'notification' }] },
        { id: 'catalog', name: 'Catalog', responsibilities: [{ id: 'products', label: 'Products', domain: 'catalog' }] },
      ],
    },
    coChanges: [['receipt-email', 'templates', 4], ['order-flow', 'products', 1]],
    history: {
      type: 'history', title: 'Saved changes over time', note: 'Repeated shared changes reveal the misplaced work',
      aria: 'Orders and Notifications change together four times. Orders and Catalog share one isolated change.',
      lanes: [['orders', 'Orders'], ['notifications', 'Notifications'], ['catalog', 'Catalog']],
      commits: [['c1', 132, ['orders']], ['c2', 190, ['orders', 'notifications']], ['c3', 248, ['notifications']], ['c4', 306, ['orders', 'notifications']], ['c5', 364, ['orders', 'catalog']], ['c6', 422, ['orders', 'notifications']], ['c7', 480, ['orders', 'notifications']]],
    },
  },
  {
    label: 'Action 3 · Extract a new service',
    title: 'One service contains two different jobs.',
    brief: 'Accounts manages profiles and permissions, but it also generates invoices. Invoice work changes independently from the account work.',
    instruction: 'Select <strong>Invoices</strong>, then place it in the dashed <strong>New service</strong> area.',
    when: 'Extract a responsibility when it is a coherent job with its own rhythm and the original service contains clearly separate concerns.',
    tradeoff: 'Focus improves, but every new service adds deployment, monitoring, and communication overhead.',
    result: 'Account work and invoice work can now evolve separately. The system gains a boundary, so that independence must justify the extra operational cost.',
    expected: { type: 'split-service', sourceId: 'invoices' },
    state: {
      services: [
        { id: 'accounts', name: 'Accounts', responsibilities: [{ id: 'profiles', label: 'Profiles', domain: 'account' }, { id: 'permissions', label: 'Permissions', domain: 'account' }, { id: 'invoices', label: 'Invoices', domain: 'billing' }] },
        { id: 'catalog', name: 'Catalog', responsibilities: [{ id: 'items', label: 'Products', domain: 'catalog' }, { id: 'categories', label: 'Categories', domain: 'catalog' }] },
        { id: 'search', name: 'Search', responsibilities: [{ id: 'queries', label: 'Search queries', domain: 'search' }] },
      ],
    },
    coChanges: [['profiles', 'permissions', 3], ['items', 'queries', 1]],
    history: {
      type: 'history', title: 'Saved changes over time', note: 'Invoices follow a separate rhythm',
      aria: 'Accounts changes repeatedly, with invoice-only changes between account changes. Catalog and Search share one change.',
      lanes: [['accounts', 'Accounts'], ['catalog', 'Catalog'], ['search', 'Search']],
      commits: [['c1', 132, ['accounts']], ['c2', 190, ['accounts']], ['c3', 248, ['catalog']], ['c4', 306, ['accounts']], ['c5', 364, ['catalog', 'search']], ['c6', 422, ['accounts']], ['c7', 480, ['search']]],
    },
  },
];

const architectureMission = {
  label: 'Try it yourself · Service boundaries',
  title: 'Prepare the shop for its next release.',
  brief: 'The diagram says there are four independent services. The history tells a messier story. Redesign the boundaries, then simulate the next release.',
  stakes: 'The release is tomorrow. Repeated cross-service changes are slowing the team down, but a rushed merge could create an even bigger service.',
  objective: ['Reduce cross-service coordination to 2 or less', 'Keep service focus at 90% or more', 'Keep the largest service at 4 responsibilities or fewer'],
  state: {
    services: [
      { id: 'checkout', name: 'Checkout', responsibilities: [{ id: 'cart', label: 'Cart', domain: 'checkout' }, { id: 'promotions', label: 'Promotions', domain: 'checkout' }, { id: 'stock-validation', label: 'Stock validation', domain: 'inventory' }] },
      { id: 'inventory', name: 'Inventory', responsibilities: [{ id: 'stock', label: 'Stock', domain: 'inventory' }, { id: 'reservation', label: 'Reservation', domain: 'inventory' }] },
      { id: 'catalog', name: 'Catalog', responsibilities: [{ id: 'products', label: 'Products', domain: 'catalog' }, { id: 'search-indexing', label: 'Search indexing', domain: 'search' }, { id: 'recommendations', label: 'Recommendations', domain: 'catalog' }] },
      { id: 'search', name: 'Search', responsibilities: [{ id: 'search-api', label: 'Search API', domain: 'search' }] },
    ],
  },
  coChanges: [['stock-validation', 'stock', 4], ['search-indexing', 'search-api', 3], ['cart', 'products', 1], ['promotions', 'recommendations', 1]],
  goals: { coordination: 2, focus: 90, largest: 4 },
  history: {
    type: 'history', title: 'Git history · 10 saved changes', note: 'Find repeated patterns, not a single coincidence',
    aria: 'Checkout and Inventory share several changes. Catalog and Search also share several changes. Other shared changes occur only once.',
    lanes: [['checkout', 'Checkout'], ['inventory', 'Inventory'], ['catalog', 'Catalog'], ['search', 'Search']],
    commits: [['c1', 124, ['checkout']], ['c2', 164, ['checkout', 'inventory']], ['c3', 204, ['catalog']], ['c4', 244, ['catalog', 'search']], ['c5', 284, ['checkout', 'inventory']], ['c6', 324, ['checkout', 'catalog']], ['c7', 364, ['catalog', 'search']], ['c8', 404, ['inventory']], ['c9', 444, ['checkout', 'inventory']], ['c10', 484, ['catalog', 'search']]],
  },
};

const teamTraining = [
  {
    label: 'Action 1 · Move a person',
    title: 'The work moved, but the org chart did not.',
    brief: 'Mia belongs to Team Blue, yet almost all her recent work is on Accounts, owned by Team Green.',
    instruction: 'Select <strong>Mia</strong>, then place her in <strong>Team Green</strong>.',
    when: 'Move a person when their work has shifted for the long term—not for occasional help on one change.',
    tradeoff: 'Handoffs fall, but the move changes team knowledge and relationships. Check that both teams remain healthy.',
    result: 'Mia now works with the team responsible for Accounts, so her recurring changes no longer cross a team boundary.',
    expected: { type: 'move-person', sourceId: 'mia', targetId: 'green' },
    state: {
      services: [{ id: 'billing', name: 'Billing' }, { id: 'accounts', name: 'Accounts' }],
      people: [{ id: 'leo', name: 'Leo', contributions: { billing: 8 } }, { id: 'mia', name: 'Mia', contributions: { accounts: 7 } }, { id: 'zoe', name: 'Zoe', contributions: { accounts: 8 } }],
      teams: [{ id: 'blue', name: 'Team Blue', people: ['leo', 'mia'], owns: ['billing'] }, { id: 'green', name: 'Team Green', people: ['zoe'], owns: ['accounts'] }],
    },
  },
  {
    label: 'Action 2 · Transfer ownership',
    title: 'Responsibility stayed behind after a migration.',
    brief: 'Team River officially owns Search, but Team Forest now performs nearly all Search work and has room to take responsibility for it.',
    instruction: 'Select the <strong>Search ownership</strong> chip, then place it in <strong>Team Forest</strong>.',
    when: 'Transfer ownership when another team already maintains most of the service and has enough capacity to own its decisions and incidents.',
    tradeoff: 'The formal boundary matches reality, but documentation, access, and operational knowledge must move too.',
    result: 'The team doing the work is now also accountable for Search. Informal maintenance and formal responsibility align.',
    expected: { type: 'transfer-ownership', sourceId: 'search', targetId: 'forest' },
    state: {
      services: [{ id: 'catalog', name: 'Catalog' }, { id: 'search', name: 'Search' }],
      people: [{ id: 'ivy', name: 'Ivy', contributions: { catalog: 7 } }, { id: 'ben', name: 'Ben', contributions: { search: 2 } }, { id: 'kai', name: 'Kai', contributions: { search: 9 } }],
      teams: [{ id: 'river', name: 'Team River', people: ['ivy', 'ben'], owns: ['catalog', 'search'] }, { id: 'forest', name: 'Team Forest', people: ['kai'], owns: [] }],
    },
  },
  {
    label: 'Action 3 · Merge teams',
    title: 'Two tiny teams cannot finish a feature alone.',
    brief: 'Team Sun and Team Moon share every release and every on-call incident. Their work is inseparable, not merely collaborative.',
    instruction: 'Select <strong>Team Sun</strong>, then place it on <strong>Team Moon</strong>.',
    when: 'Merge teams when their work and decisions are persistently inseparable and a shared mission is clearer than a permanent handoff.',
    tradeoff: 'Coordination falls, but a larger team can accumulate too much scope and cognitive load.',
    result: 'One team can now make the shared decisions internally. Its larger scope is the new risk to monitor.',
    expected: { type: 'merge-team', pair: ['sun', 'moon'] },
    state: {
      services: [{ id: 'orders', name: 'Orders' }, { id: 'payment', name: 'Payment' }, { id: 'profile', name: 'Profile' }],
      people: [{ id: 'ana', name: 'Ana', contributions: { orders: 5, payment: 4 } }, { id: 'max', name: 'Max', contributions: { orders: 4, payment: 5 } }, { id: 'lia', name: 'Lia', contributions: { profile: 7 } }],
      teams: [{ id: 'sun', name: 'Team Sun', people: ['ana'], owns: ['orders'] }, { id: 'moon', name: 'Team Moon', people: ['max'], owns: ['payment'] }, { id: 'star', name: 'Team Star', people: ['lia'], owns: ['profile'] }],
    },
  },
  {
    label: 'Action 4 · Split a team',
    title: 'One team already contains two independent groups.',
    brief: 'Team Atlas owns Accounts and Reporting. Eva works only on Reporting; the rest of Atlas works on Accounts.',
    instruction: 'Select the <strong>Reporting ownership</strong> chip, then place it in the dashed <strong>New team</strong> area.',
    when: 'Split a team when distinct groups already serve independent missions and can operate without constant coordination.',
    tradeoff: 'Each group gains focus, but a new boundary creates another place where work may need to be handed over.',
    result: 'Reporting gets a focused team and its strongest contributor moves with it. The new boundary is worthwhile only while the missions stay independent.',
    expected: { type: 'split-team', sourceId: 'reporting' },
    state: {
      services: [{ id: 'accounts', name: 'Accounts' }, { id: 'reporting', name: 'Reporting' }],
      people: [{ id: 'tom', name: 'Tom', contributions: { accounts: 8 } }, { id: 'sue', name: 'Sue', contributions: { accounts: 6 } }, { id: 'eva', name: 'Eva', contributions: { reporting: 9 } }],
      teams: [{ id: 'atlas', name: 'Team Atlas', people: ['tom', 'sue', 'eva'], owns: ['accounts', 'reporting'] }],
    },
  },
];

const teamMission = {
  label: 'Try it yourself · Team boundaries',
  title: 'Make responsibility match the real work.',
  brief: 'Ownership says one thing; the saved changes say another. Reorganize people, services, or teams, then simulate the next release.',
  stakes: 'Friday’s release crosses three teams. You have one redesign cycle to reduce handoffs without overloading a single team.',
  objective: ['Reduce cross-team handoffs to 2 or less', 'Reach at least 90% ownership alignment', 'Keep every team load at 6 points or less'],
  state: {
    services: [{ id: 'billing', name: 'Billing' }, { id: 'accounts', name: 'Accounts' }, { id: 'reporting', name: 'Reporting' }],
    people: [
      { id: 'nora', name: 'Nora', contributions: { billing: 8 } }, { id: 'marco', name: 'Marco', contributions: { accounts: 6 } },
      { id: 'sam', name: 'Sam', contributions: { accounts: 8 } }, { id: 'lea', name: 'Lea', contributions: { reporting: 6 } },
      { id: 'ava', name: 'Ava', contributions: { reporting: 8 } }, { id: 'omar', name: 'Omar', contributions: { billing: 6 } },
    ],
    teams: [
      { id: 'north', name: 'Team North', people: ['nora', 'marco'], owns: ['billing'] },
      { id: 'east', name: 'Team East', people: ['sam', 'lea'], owns: ['accounts'] },
      { id: 'south', name: 'Team South', people: ['ava', 'omar'], owns: ['reporting'] },
    ],
  },
  goals: { handoffs: 2, alignment: 90, load: 6 },
};

const advancedArchitectureMission = {
  label: 'Advanced mission · Localized coupling',
  title: 'Fix the hotspot without over-correcting.',
  brief: 'Orders and Notifications often change together, but the repeated work is concentrated in event translation. A one-off platform upgrade also touched every service.',
  stakes: 'A maintenance window is approaching. Fix the recurring hotspot without redesigning around a one-off upgrade.',
  objective: ['Reduce recurring coordination to 2 or less', 'Keep service focus at 85% or more', 'Avoid a service larger than 4 responsibilities'],
  state: {
    services: [
      { id: 'orders', name: 'Orders', responsibilities: [{ id: 'order-api', label: 'Order API', domain: 'orders' }, { id: 'event-mapper', label: 'Event mapper', domain: 'notification' }, { id: 'order-store', label: 'Persistence', domain: 'orders' }] },
      { id: 'notifications', name: 'Notifications', responsibilities: [{ id: 'event-consumer', label: 'Event consumer', domain: 'notification' }, { id: 'templates', label: 'Templates', domain: 'notification' }] },
      { id: 'inventory', name: 'Inventory', responsibilities: [{ id: 'warehouse', label: 'Warehouse', domain: 'inventory' }, { id: 'availability', label: 'Availability', domain: 'inventory' }] },
      { id: 'search', name: 'Search', responsibilities: [{ id: 'search-api', label: 'Search API', domain: 'search' }] },
    ],
  },
  coChanges: [['event-mapper', 'event-consumer', 7], ['order-api', 'templates', 1], ['warehouse', 'search-api', 1]],
  goals: { coordination: 2, focus: 85, largest: 4 },
  history: {
    type: 'history', title: 'Git history · maintenance event included', note: 'c4 is a one-off framework upgrade',
    aria: 'Orders and Notifications repeatedly change together. Commit c4 is a framework upgrade that touches all four services once.',
    lanes: [['orders', 'Orders'], ['notifications', 'Notifications'], ['inventory', 'Inventory'], ['search', 'Search']],
    commits: [['c1', 124, ['orders']], ['c2', 169, ['orders', 'notifications']], ['c3', 214, ['inventory']], ['c4', 259, ['orders', 'notifications', 'inventory', 'search'], 'Framework upgrade'], ['c5', 304, ['orders', 'notifications']], ['c6', 349, ['search']], ['c7', 394, ['orders', 'notifications']], ['c8', 439, ['inventory', 'search']], ['c9', 484, ['orders', 'notifications']]],
  },
};

const advancedTeamMission = {
  label: 'Advanced mission · After the migration',
  title: 'Choose between moving people and moving ownership.',
  brief: 'A platform migration changed who performs the work. Occasional help is normal; repeated cross-team maintenance is expensive. Find a balanced structure.',
  stakes: 'The migration is complete, but its handoffs remain. Align the recurring work before the next on-call rotation.',
  objective: ['Reduce cross-team handoffs to 4 or less', 'Reach at least 85% ownership alignment', 'Keep every team load at 7 points or less'],
  state: {
    services: [{ id: 'gateway', name: 'Gateway' }, { id: 'identity', name: 'Identity' }, { id: 'audit', name: 'Audit' }, { id: 'messaging', name: 'Messaging' }],
    people: [
      { id: 'amy', name: 'Amy', contributions: { gateway: 8, identity: 1 } }, { id: 'raj', name: 'Raj', contributions: { identity: 7 } },
      { id: 'kim', name: 'Kim', contributions: { audit: 8 } }, { id: 'eli', name: 'Eli', contributions: { messaging: 7, audit: 1 } },
      { id: 'jo', name: 'Jo', contributions: { identity: 6, gateway: 1 } }, { id: 'pat', name: 'Pat', contributions: { messaging: 6 } },
    ],
    teams: [
      { id: 'edge', name: 'Team Edge', people: ['amy', 'raj'], owns: ['gateway', 'identity'] },
      { id: 'trust', name: 'Team Trust', people: ['kim', 'jo'], owns: ['audit'] },
      { id: 'flow', name: 'Team Flow', people: ['eli', 'pat'], owns: ['messaging'] },
    ],
  },
  goals: { handoffs: 4, alignment: 85, load: 7 },
};

const couplingJourney = [
  { type: 'architecture-tutorial', label: 'Service training', items: architectureTraining },
  { type: 'architecture-mission', label: 'Service mission', scenario: architectureMission },
  { type: 'team-tutorial', label: 'Team training', items: teamTraining },
  { type: 'team-mission', label: 'Team mission', scenario: teamMission },
  { type: 'architecture-mission', label: 'Advanced services', scenario: advancedArchitectureMission, advanced: true },
  { type: 'team-mission', label: 'Advanced teams', scenario: advancedTeamMission, advanced: true },
];

const testingRounds = [
  {
    label: 'Checkout change',
    brief: 'Changed <code>OrderService.calculateTotal()</code>. Impact trace: Checkout → Order → Inventory.',
    budget: 12,
    impactPath: [
      ['Checkout', false],
      ['Order', true],
      ['Inventory', false],
    ],
    tests: [
      ['OrderServiceTest', 3, true],
      ['InventoryContractTest', 4, true],
      ['CheckoutFlowTest', 5, true],
      ['PaymentGatewayIT', 6, false],
      ['NotificationTemplateTest', 2, false],
      ['UserProfileTest', 3, false],
    ],
    explanation: 'The focused Order, Inventory, and Checkout tests cover the impacted path in exactly 12 seconds.',
  },
  {
    label: 'Authentication change',
    brief: 'Changed <code>AuthTokenValidator</code>. Impact trace: Gateway → Auth → User profile.',
    budget: 10,
    impactPath: [
      ['Gateway', false],
      ['Auth', true],
      ['User profile', false],
    ],
    tests: [
      ['TokenValidatorTest', 3, true],
      ['GatewayAuthContractTest', 4, true],
      ['UserSessionTest', 3, true],
      ['CatalogSearchTest', 4, false],
      ['InvoiceExportIT', 5, false],
      ['EmailPreferencesTest', 2, false],
    ],
    explanation: 'Token, gateway-contract, and session tests follow the changed authentication path and fit the 10-second budget.',
  },
  {
    label: 'Pricing change',
    brief: 'Changed <code>PricingRules.applyDiscount()</code>. Impact trace: Catalog → Pricing → Promotion.',
    budget: 11,
    impactPath: [
      ['Catalog', false],
      ['Pricing', true],
      ['Promotion', false],
    ],
    tests: [
      ['PricingRulesTest', 3, true],
      ['PromotionContractTest', 4, true],
      ['CatalogPriceFlowTest', 4, true],
      ['ShippingEstimatorTest', 3, false],
      ['AccountDeletionIT', 6, false],
      ['AuditLogTest', 2, false],
    ],
    explanation: 'The three tests on the Catalog–Pricing–Promotion path provide targeted feedback in 11 seconds.',
  },
];

const focusGameHeading = (stage) => {
  const heading = stage.querySelector('[data-game-focus]');
  if (heading) heading.focus();
};

const renderProgress = (roundIndex, roundCount, score, scoreMaximum) => `
  <div class="game-progress-row">
    <p class="game-progress">Round ${roundIndex + 1} / ${roundCount}</p>
    <span class="game-score">Score ${score} / ${scoreMaximum}</span>
  </div>
  <div class="game-progress-track" aria-hidden="true"><span style="width: ${((roundIndex + 1) / roundCount) * 100}%"></span></div>
`;

const graphFrame = (graph, className, content, viewBox = '0 0 540 230') => `
  <figure class="research-graph ${className}">
    <div class="graph-title"><span>${graph.title}</span><span>${graph.note}</span></div>
    <svg viewBox="${viewBox}" role="img" aria-label="${graph.aria}">${content}</svg>
  </figure>
`;

const renderHistoryGraph = (graph) => {
  const laneTop = 64;
  const laneGap = 42;
  const lanePositions = Object.fromEntries(graph.lanes.map(([id], index) => [id, laneTop + (index * laneGap)]));
  const lanes = graph.lanes.map(([id, label]) => `
    <g class="history-lane">
      <text x="16" y="${lanePositions[id] + 4}">${label}</text>
      <line x1="104" y1="${lanePositions[id]}" x2="506" y2="${lanePositions[id]}"></line>
    </g>
  `).join('');
  const commits = graph.commits.map(([id, x, touchedServices, eventLabel]) => {
    const touchedY = touchedServices.map((serviceId) => lanePositions[serviceId]);
    const minimumY = Math.min(...touchedY);
    const maximumY = Math.max(...touchedY);
    const connector = touchedServices.length > 1
      ? `<line class="history-connector" x1="${x}" y1="${minimumY}" x2="${x}" y2="${maximumY}"></line>`
      : '';
    const dots = touchedY.map((y) => `<circle class="history-commit" cx="${x}" cy="${y}" r="5"></circle>`).join('');
    const event = eventLabel
      ? `<g class="history-event"><line x1="${x}" y1="37" x2="${x}" y2="${maximumY + 15}"></line><text x="${x + 6}" y="31">${eventLabel}</text></g>`
      : '';

    return `<g>${event}<text class="history-commit-label" x="${x}" y="49">${id}</text>${connector}${dots}</g>`;
  }).join('');

  return graphFrame(graph, 'history-graph', `${lanes}${commits}`);
};

const renderEvolutionGraph = (graph) => {
  const plot = { left: 58, right: 514, top: 42, bottom: 180 };
  const maximum = 70;
  const xFor = (index) => plot.left + (index * ((plot.right - plot.left) / (graph.releases.length - 1)));
  const yFor = (value) => plot.bottom - ((value / maximum) * (plot.bottom - plot.top));
  const grid = [0, 35, 70].map((value) => `
    <g class="evolution-grid">
      <line x1="${plot.left}" y1="${yFor(value)}" x2="${plot.right}" y2="${yFor(value)}"></line>
      <text x="48" y="${yFor(value) + 4}">${value}</text>
    </g>
  `).join('');
  const releases = graph.releases.map((release, index) => `<text class="evolution-release" x="${xFor(index)}" y="202">${release}</text>`).join('');
  const events = graph.events.map(([index, label], eventIndex) => {
    const x = xFor(index);
    const rightAligned = index > graph.releases.length / 2;
    return `<g class="evolution-event event-${eventIndex + 1}"><line x1="${x}" y1="31" x2="${x}" y2="${plot.bottom}"></line><text x="${rightAligned ? x - 6 : x + 6}" y="${eventIndex ? 27 : 16}" text-anchor="${rightAligned ? 'end' : 'start'}">${label}</text></g>`;
  }).join('');
  const series = graph.series.map(([label, values, className]) => {
    const points = values.map((value, index) => `${xFor(index)},${yFor(value)}`).join(' ');
    const dots = values.map((value, index) => `<circle cx="${xFor(index)}" cy="${yFor(value)}" r="3.5"></circle>`).join('');
    return `<g class="evolution-series ${className}" aria-label="${label}"><polyline points="${points}"></polyline>${dots}</g>`;
  }).join('');
  const legend = graph.series.map(([label, , className], index) => `
    <g class="evolution-legend ${className}" transform="translate(${20 + ((index % 2) * 270)} ${218 + (Math.floor(index / 2) * 18)})">
      <line x1="0" y1="0" x2="24" y2="0"></line><text x="31" y="4">${label}</text>
    </g>
  `).join('');

  return graphFrame(graph, 'evolution-graph', `${grid}${events}${series}${releases}${legend}`, '0 0 540 252');
};

const renderTeamGraph = (graph) => {
  const nodes = Object.fromEntries([...graph.teams, ...graph.services].map(([id, label, x, y]) => [id, { label, x, y }]));
  const ownership = graph.ownership.map(([fromId, toId, label]) => {
    const from = nodes[fromId];
    const to = nodes[toId];
    return `<g class="team-link ownership-link"><line x1="${from.x + 58}" y1="${from.y}" x2="${to.x - 58}" y2="${to.y}"></line><text x="270" y="${from.y - 9}">${label}</text></g>`;
  }).join('');
  const contributions = graph.contributions.map(([fromId, toId, label, labelX, labelY]) => {
    const from = nodes[fromId];
    const to = nodes[toId];
    return `<g class="team-link contribution-link"><path d="M ${from.x + 58} ${from.y} C 222 ${from.y}, 318 ${to.y}, ${to.x - 58} ${to.y}"></path><text x="${labelX}" y="${labelY}">${label}</text></g>`;
  }).join('');
  const nodeMarkup = [...graph.teams.map((node) => [...node, 'team']), ...graph.services.map((node) => [...node, 'service'])]
    .map(([, label, x, y, kind]) => `
      <g class="team-node ${kind}-node" transform="translate(${x} ${y})">
        <rect x="-58" y="-20" width="116" height="40" rx="10"></rect>
        <text y="5">${label}</text>
      </g>
    `).join('');
  const columnLabels = '<text class="team-column-label" x="82" y="27">Teams</text><text class="team-column-label" x="458" y="27">Microservices</text>';

  return graphFrame(graph, 'team-graph', `${columnLabels}${ownership}${contributions}${nodeMarkup}`);
};

const renderResponsibilityGraph = (graph) => {
  const yPositions = [78, 128, 178];
  const nodes = {};
  const makeColumn = (column, x, side) => {
    const items = column.items.map(([id, label], index) => {
      const y = yPositions[index];
      nodes[id] = { x, y };
      return `<g class="responsibility-node" transform="translate(${x} ${y})"><rect x="-78" y="-17" width="156" height="34" rx="8"></rect><text y="5">${label}</text></g>`;
    }).join('');
    return `<g class="responsibility-column ${side}"><text x="${x}" y="30">${column.label}</text><rect x="${x - 88}" y="43" width="176" height="158" rx="13"></rect>${items}</g>`;
  };
  const columns = `${makeColumn(graph.left, 106, 'left')}${makeColumn(graph.right, 434, 'right')}`;
  const links = graph.links.map(([fromId, toId, label]) => {
    const from = nodes[fromId];
    const to = nodes[toId];
    return `<g class="responsibility-link"><line x1="${from.x + 78}" y1="${from.y}" x2="${to.x - 78}" y2="${to.y}"></line><text x="270" y="${((from.y + to.y) / 2) - 7}">${label}</text></g>`;
  }).join('');

  return graphFrame(graph, 'responsibility-graph', `${columns}${links}`);
};

const renderCouplingGraph = (graph) => {
  if (graph.type === 'history') return renderHistoryGraph(graph);
  if (graph.type === 'evolution') return renderEvolutionGraph(graph);
  if (graph.type === 'teams') return renderTeamGraph(graph);
  if (graph.type === 'responsibilities') return renderResponsibilityGraph(graph);
  return '';
};

const renderImpactGraph = (impactPath) => {
  const nodes = impactPath.map(([label, isChanged], index) => `
    ${index ? '<span class="impact-arrow" aria-hidden="true">→</span>' : ''}
    <div class="impact-node${isChanged ? ' is-changed' : ''}">
      ${isChanged ? '<span>Changed</span>' : '<span>Impacted</span>'}
      <strong>${label}</strong>
    </div>
  `).join('');
  const accessiblePath = impactPath.map(([label, isChanged]) => `${label}${isChanged ? ', changed component' : ', impacted component'}`).join(' to ');

  return `
    <figure class="research-graph impact-graph" aria-label="Change impact path: ${accessiblePath}">
      <div class="graph-title"><span>Change impact pattern</span><span>Follow the path</span></div>
      <div class="impact-track">${nodes}</div>
    </figure>
  `;
};

const couplingLabState = new WeakMap();
const couplingStoryTimers = new WeakMap();

const couplingStoryScenes = [
  {
    kicker: 'A project begins',
    line: 'Maya and Leo build a shop from small, independent services.',
    accent: 'Each service has one job.',
    duration: 2100,
  },
  {
    kicker: 'Monday',
    line: 'Checkout changes.',
    accent: 'Inventory must change too.',
    duration: 2200,
  },
  {
    kicker: 'Tuesday',
    line: 'Checkout changes again.',
    accent: 'Inventory follows again.',
    duration: 2200,
  },
  {
    kicker: 'Wednesday',
    line: 'A Catalog update pulls Search into the same release.',
    accent: 'Another boundary crossed.',
    duration: 2200,
  },
  {
    kicker: 'Something does not add up',
    line: 'Different code. Separate services.',
    accent: 'The architecture says they are independent.',
    duration: 2700,
  },
  {
    kicker: 'But the history tells another story',
    line: 'They keep changing together.',
    accent: 'What is really moving together?',
    duration: 3600,
  },
];

const clearCouplingStory = (stage) => {
  const timer = couplingStoryTimers.get(stage);
  if (timer) window.clearTimeout(timer);
  couplingStoryTimers.delete(stage);
};

const cloneLabState = (state) => JSON.parse(JSON.stringify(state));

const getArchitectureMetrics = (state, coChanges) => {
  const serviceForResponsibility = {};
  let focusedResponsibilities = 0;
  let responsibilityCount = 0;

  state.services.forEach((service) => {
    const domainCounts = {};
    service.responsibilities.forEach((responsibility) => {
      serviceForResponsibility[responsibility.id] = service.id;
      domainCounts[responsibility.domain] = (domainCounts[responsibility.domain] || 0) + 1;
      responsibilityCount += 1;
    });
    focusedResponsibilities += Math.max(0, ...Object.values(domainCounts));
  });

  const coordination = coChanges.reduce((total, [leftId, rightId, weight]) => (
    serviceForResponsibility[leftId] && serviceForResponsibility[rightId] && serviceForResponsibility[leftId] !== serviceForResponsibility[rightId]
      ? total + weight
      : total
  ), 0);

  return {
    coordination,
    focus: responsibilityCount ? Math.round((focusedResponsibilities / responsibilityCount) * 100) : 100,
    largest: Math.max(0, ...state.services.map((service) => service.responsibilities.length)),
    boundaries: state.services.length,
  };
};

const getTeamMetrics = (state) => {
  const teamForPerson = {};
  const ownerForService = {};
  let totalChanges = 0;
  let handoffs = 0;

  state.teams.forEach((team) => {
    team.people.forEach((personId) => { teamForPerson[personId] = team.id; });
    team.owns.forEach((serviceId) => { ownerForService[serviceId] = team.id; });
  });

  state.people.forEach((person) => {
    Object.entries(person.contributions).forEach(([serviceId, count]) => {
      totalChanges += count;
      if (teamForPerson[person.id] !== ownerForService[serviceId]) handoffs += count;
    });
  });

  return {
    handoffs,
    alignment: totalChanges ? Math.round(((totalChanges - handoffs) / totalChanges) * 100) : 100,
    load: Math.max(0, ...state.teams.map((team) => (team.owns.length * 2) + team.people.length)),
    teams: state.teams.length,
  };
};

const getCurrentLabPhase = (runtime) => couplingJourney[runtime.phaseIndex];

const getCurrentLabScenario = (runtime) => {
  const phase = getCurrentLabPhase(runtime);
  return phase.items ? phase.items[runtime.tutorialIndex] : phase.scenario;
};

const isArchitecturePhase = (phase) => phase.type.startsWith('architecture');

const loadLabScenario = (runtime) => {
  const scenario = getCurrentLabScenario(runtime);
  runtime.state = cloneLabState(scenario.state);
  runtime.initialState = cloneLabState(scenario.state);
  runtime.strategyActionsAtLoad = [...runtime.strategyActions];
  runtime.history = [];
  runtime.actions = [];
  runtime.selected = null;
  runtime.simulated = false;
  runtime.tutorialActionComplete = false;
  runtime.status = isArchitecturePhase(getCurrentLabPhase(runtime))
    ? 'Select a service or responsibility, then choose where it should go.'
    : 'Select a team, person, or ownership chip, then choose its destination.';
};

const renderLabJourney = (runtime) => {
  const chapters = [
    { number: '1', label: 'Service boundaries', detail: 'Learn + mission', start: 0, end: 1 },
    { number: '2', label: 'Team boundaries', detail: 'Learn + mission', start: 2, end: 3 },
    { number: '★', label: 'Optional challenges', detail: 'Two advanced cases', start: 4, end: 5 },
  ];
  const currentChapter = chapters.find((chapter) => runtime.phaseIndex >= chapter.start && runtime.phaseIndex <= chapter.end);
  const currentMode = runtime.phaseIndex === 0 || runtime.phaseIndex === 2
    ? 'Guided practice'
    : runtime.phaseIndex < 4
      ? 'Try it yourself'
      : `Optional challenge ${runtime.phaseIndex - 3} of 2`;
  const markers = chapters.map((chapter) => `
    <li class="lab-journey-step${chapter === currentChapter ? ' is-current' : ''}${runtime.phaseIndex > chapter.end ? ' is-complete' : ''}${chapter.start === 4 ? ' is-optional' : ''}">
      <span>${runtime.phaseIndex > chapter.end ? '✓' : chapter.number}</span>
      <small><strong>${chapter.label}</strong><span>${chapter.detail}</span></small>
    </li>
  `).join('');

  return `
    <div class="lab-progress-row">
      <p class="game-progress">${currentChapter?.label || 'Coupling Lab'} · ${currentMode}</p>
      <span class="game-score">Read evidence → redesign → compare</span>
    </div>
    <ol class="lab-journey" aria-label="Coupling Lab progress">${markers}</ol>
  `;
};

const renderArchitectureTerms = (compact = false) => compact ? `
  <details class="lab-terms-reminder">
    <summary>Need a quick definition?</summary>
    <p><strong>Logical coupling</strong> means separate services repeatedly need changes together. <strong>MLCI</strong> measures that pattern from saved Git changes.</p>
  </details>
` : `
  <div class="lab-terms" aria-label="Plain-language definitions">
    <div><strong>Microservice</strong><span>A small program with one specific job.</span></div>
    <div><strong>Saved change</strong><span>A recorded code update, also called a Git commit.</span></div>
    <div><strong>Logical coupling</strong><span>Separate services that repeatedly need changes together.</span></div>
  </div>
  <p class="lab-research-note">Researchers can measure this pattern from Git history. <strong>MLCI</strong> means Microservice Logical Coupling Index.</p>
`;

const renderTeamTerms = (compact = false) => compact ? `
  <details class="lab-terms-reminder">
    <summary>Need a quick definition?</summary>
    <p><strong>Ownership</strong> is formal responsibility. <strong>Contribution</strong> is who actually changed the code. Repeated work across that boundary is organizational coupling.</p>
  </details>
` : `
  <div class="lab-terms" aria-label="Plain-language definitions">
    <div><strong>Ownership</strong><span>The team formally responsible for decisions and incidents.</span></div>
    <div><strong>Contribution</strong><span>Who actually changed the code, regardless of ownership.</span></div>
    <div><strong>Organizational coupling</strong><span>Work repeatedly crosses the formal team boundaries.</span></div>
  </div>
`;

const renderArchitectureTools = (scenario, tutorial) => {
  const currentType = tutorial ? scenario.expected.type : '';
  const tools = [
    ['merge-service', 'Merge', 'service → service'],
    ['move-responsibility', 'Move', 'responsibility → service'],
    ['split-service', 'Extract', 'responsibility → New service'],
  ];

  return `<div class="lab-toolbox" aria-label="Available actions">${tools.map(([type, label, gesture]) => `
    <div class="lab-tool${currentType === type ? ' is-current' : ''}"><strong>${label}</strong><span>${gesture}</span></div>
  `).join('')}</div>`;
};

const renderTeamTools = (scenario, tutorial) => {
  const currentType = tutorial ? scenario.expected.type : '';
  const tools = [
    ['move-person', 'Move person', 'person → team'],
    ['transfer-ownership', 'Transfer ownership', 'ownership → team'],
    ['merge-team', 'Merge teams', 'team → team'],
    ['split-team', 'Split team', 'ownership → New team'],
  ];

  return `<div class="lab-toolbox team-tools" aria-label="Available actions">${tools.map(([type, label, gesture]) => `
    <div class="lab-tool${currentType === type ? ' is-current' : ''}"><strong>${label}</strong><span>${gesture}</span></div>
  `).join('')}</div>`;
};

const isGuidedSource = (scenario, kind, id) => {
  if (!scenario.expected) return false;
  const { expected } = scenario;
  if (expected.pair) return (kind === 'service' || kind === 'team') && expected.pair.includes(id);
  if (['move-responsibility', 'split-service'].includes(expected.type)) return kind === 'responsibility' && expected.sourceId === id;
  if (expected.type === 'move-person') return kind === 'person' && expected.sourceId === id;
  if (['transfer-ownership', 'split-team'].includes(expected.type)) return kind === 'ownership' && expected.sourceId === id;
  return false;
};

const isGuidedTarget = (scenario, kind, id) => {
  if (!scenario.expected) return false;
  const { expected } = scenario;
  if (expected.pair) return (kind === 'service' || kind === 'team') && expected.pair.includes(id);
  if (expected.type === 'split-service') return kind === 'new-service';
  if (expected.type === 'split-team') return kind === 'new-team';
  return expected.targetId === id;
};

const isRecentlyAffected = (runtime, kind, id) => {
  const action = runtime.lastAction;
  if (!action) return false;
  if (kind === 'service') {
    return action.targetId === id
      || (action.type === 'split-service' && id === `new-${action.sourceId}`);
  }
  if (kind === 'team') {
    return action.targetId === id
      || (action.type === 'split-team' && id === `new-team-${action.sourceId}`);
  }
  if (kind === 'responsibility') return ['move-responsibility', 'split-service'].includes(action.type) && action.sourceId === id;
  if (kind === 'person') return action.type === 'move-person' && action.sourceId === id;
  if (kind === 'ownership') return ['transfer-ownership', 'split-team'].includes(action.type) && action.sourceId === id;
  return false;
};

const getArchitectureImpactRows = (state, coChanges) => {
  const responsibilityMap = {};
  state.services.forEach((service) => {
    service.responsibilities.forEach((responsibility) => {
      responsibilityMap[responsibility.id] = { responsibility, service };
    });
  });

  return coChanges.map(([leftId, rightId, weight]) => {
    const left = responsibilityMap[leftId];
    const right = responsibilityMap[rightId];
    const resolved = left?.service.id === right?.service.id;
    return {
      leftId,
      rightId,
      weight,
      resolved,
      leftLabel: left?.responsibility.label || leftId,
      rightLabel: right?.responsibility.label || rightId,
      leftService: left?.service.name || 'Unknown service',
      rightService: right?.service.name || 'Unknown service',
    };
  }).sort((left, right) => right.weight - left.weight);
};

const renderArchitectureImpactMap = (runtime, scenario) => {
  if (!runtime.simulated) return '';
  const rows = getArchitectureImpactRows(runtime.state, scenario.coChanges);
  return `
    <section class="boundary-impact" aria-label="Connections after the redesign">
      <div class="boundary-impact-heading"><p class="evidence-heading">Connections revealed after simulation</p><span>Green stays inside one boundary</span></div>
      <div class="boundary-impact-list">${rows.map((row, index) => `
        <article class="boundary-impact-row ${row.resolved ? 'is-resolved' : 'is-remaining'}" style="--impact-index: ${index}">
          <span class="impact-state" aria-hidden="true">${row.resolved ? '✓' : '↔'}</span>
          <div><strong>${row.leftLabel} ↔ ${row.rightLabel}</strong><small>${row.weight} recurring shared ${row.weight === 1 ? 'change' : 'changes'}</small></div>
          <p>${row.resolved ? `Now contained inside ${row.leftService}` : `Still crosses ${row.leftService} and ${row.rightService}`}</p>
        </article>
      `).join('')}</div>
    </section>
  `;
};

const getResponsibilityImpact = (runtime, scenario, responsibilityId) => {
  if (!runtime.simulated) return null;
  const matching = getArchitectureImpactRows(runtime.state, scenario.coChanges)
    .filter((row) => row.leftId === responsibilityId || row.rightId === responsibilityId);
  if (!matching.length) return null;
  return matching.some((row) => !row.resolved) ? 'remaining' : 'resolved';
};

const renderArchitectureBoard = (runtime, scenario, tutorial) => {
  const locked = tutorial && runtime.tutorialActionComplete;
  const cards = runtime.state.services.map((service) => {
    const selected = runtime.selected?.kind === 'service' && runtime.selected.id === service.id;
    const affectedBoundary = isRecentlyAffected(runtime, 'service', service.id);
    const responsibilities = service.responsibilities.map((responsibility) => {
      const isSelected = runtime.selected?.kind === 'responsibility' && runtime.selected.id === responsibility.id;
      const guided = tutorial && isGuidedSource(scenario, 'responsibility', responsibility.id);
      const impact = getResponsibilityImpact(runtime, scenario, responsibility.id);
      const affected = isRecentlyAffected(runtime, 'responsibility', responsibility.id);
      return `<li><button class="lab-piece responsibility-piece${isSelected ? ' is-selected' : ''}${guided ? ' is-guided' : ''}${impact ? ` has-impact is-${impact}` : ''}${affected ? ' is-affected' : ''}" type="button" draggable="${!locked}" data-piece-kind="responsibility" data-piece-id="${responsibility.id}" aria-pressed="${isSelected}"${locked ? ' disabled' : ''}><span aria-hidden="true">⋮⋮</span><span class="piece-label">${responsibility.label}</span>${impact ? `<small class="piece-impact">${impact === 'resolved' ? 'Inside boundary' : 'Still crosses'}</small>` : ''}</button></li>`;
    }).join('');
    const guided = tutorial && (isGuidedSource(scenario, 'service', service.id) || isGuidedTarget(scenario, 'service', service.id));

    return `
      <article class="lab-boundary service-boundary${guided ? ' is-guided' : ''}${affectedBoundary ? ' is-affected' : ''}" data-drop-kind="service" data-target-id="${service.id}">
        <button class="boundary-handle${selected ? ' is-selected' : ''}" type="button" draggable="${!locked}" data-piece-kind="service" data-piece-id="${service.id}" data-drop-kind="service" data-target-id="${service.id}" aria-pressed="${selected}"${locked ? ' disabled' : ''}>
          <span><small>Microservice</small>${service.name}</span><span aria-hidden="true">⠿</span>
        </button>
        <ul class="responsibility-list">${responsibilities}</ul>
      </article>
    `;
  }).join('');
  const newServiceGuided = tutorial && isGuidedTarget(scenario, 'new-service');

  return `
    <div class="lab-board" aria-label="Service boundary workspace">
      <div class="boundary-grid">${cards}</div>
      <button class="new-boundary${newServiceGuided ? ' is-guided' : ''}" type="button" data-drop-kind="new-service"${locked ? ' disabled' : ''}>
        <span aria-hidden="true">＋</span><strong>New service</strong><small>Drop one responsibility here to extract it</small>
      </button>
      ${renderArchitectureImpactMap(runtime, scenario)}
    </div>
  `;
};

const getPersonById = (state, personId) => state.people.find((person) => person.id === personId);
const getServiceById = (state, serviceId) => state.services.find((service) => service.id === serviceId);

const getTeamImpactRows = (state) => {
  const teamForPerson = {};
  const ownerForService = {};
  state.teams.forEach((team) => {
    team.people.forEach((personId) => { teamForPerson[personId] = team; });
    team.owns.forEach((serviceId) => { ownerForService[serviceId] = team; });
  });

  return state.people.flatMap((person) => Object.entries(person.contributions).map(([serviceId, count]) => {
    const team = teamForPerson[person.id];
    const owner = ownerForService[serviceId];
    return {
      personId: person.id,
      personName: person.name,
      serviceName: getServiceById(state, serviceId)?.name || serviceId,
      teamName: team?.name || 'Unassigned',
      ownerName: owner?.name || 'No owner',
      count,
      resolved: Boolean(team && owner && team.id === owner.id),
    };
  })).sort((left, right) => right.count - left.count);
};

const getPersonImpact = (runtime, personId) => {
  if (!runtime.simulated) return null;
  const matching = getTeamImpactRows(runtime.state).filter((row) => row.personId === personId);
  return matching.some((row) => !row.resolved) ? 'remaining' : 'resolved';
};

const renderTeamImpactMap = (runtime) => {
  if (!runtime.simulated) return '';
  const rows = getTeamImpactRows(runtime.state);
  return `
    <section class="boundary-impact" aria-label="Team connections after the redesign">
      <div class="boundary-impact-heading"><p class="evidence-heading">Work paths revealed after simulation</p><span>Green work stays with its owner</span></div>
      <div class="boundary-impact-list">${rows.map((row, index) => `
        <article class="boundary-impact-row ${row.resolved ? 'is-resolved' : 'is-remaining'}" style="--impact-index: ${index}">
          <span class="impact-state" aria-hidden="true">${row.resolved ? '✓' : '→'}</span>
          <div><strong>${row.personName} → ${row.serviceName}</strong><small>${row.count} saved ${row.count === 1 ? 'change' : 'changes'}</small></div>
          <p>${row.resolved ? `Inside ${row.ownerName}'s ownership` : `${row.teamName} hands work to ${row.ownerName}`}</p>
        </article>
      `).join('')}</div>
    </section>
  `;
};

const renderTeamBoard = (runtime, scenario, tutorial) => {
  const locked = tutorial && runtime.tutorialActionComplete;
  const cards = runtime.state.teams.map((team) => {
    const selected = runtime.selected?.kind === 'team' && runtime.selected.id === team.id;
    const affectedBoundary = isRecentlyAffected(runtime, 'team', team.id);
    const people = team.people.map((personId) => {
      const person = getPersonById(runtime.state, personId);
      const isSelected = runtime.selected?.kind === 'person' && runtime.selected.id === personId;
      const guided = tutorial && isGuidedSource(scenario, 'person', personId);
      const contributions = Object.entries(person.contributions)
        .map(([serviceId, count]) => `${count} ${getServiceById(runtime.state, serviceId)?.name || serviceId}`)
        .join(' · ');
      const impact = getPersonImpact(runtime, personId);
      const affected = isRecentlyAffected(runtime, 'person', personId);
      return `<li><button class="lab-piece person-piece${isSelected ? ' is-selected' : ''}${guided ? ' is-guided' : ''}${impact ? ` has-impact is-${impact}` : ''}${affected ? ' is-affected' : ''}" type="button" draggable="${!locked}" data-piece-kind="person" data-piece-id="${personId}" aria-pressed="${isSelected}"${locked ? ' disabled' : ''}><span><strong>${person.name}</strong><small>${contributions} changes</small></span>${impact ? `<small class="piece-impact">${impact === 'resolved' ? 'With owner' : 'Crosses ownership'}</small>` : '<span aria-hidden="true">⋮⋮</span>'}</button></li>`;
    }).join('');
    const ownership = team.owns.map((serviceId) => {
      const service = getServiceById(runtime.state, serviceId);
      const isSelected = runtime.selected?.kind === 'ownership' && runtime.selected.id === serviceId;
      const guided = tutorial && isGuidedSource(scenario, 'ownership', serviceId);
      const affected = isRecentlyAffected(runtime, 'ownership', serviceId);
      return `<li><button class="lab-piece ownership-piece${isSelected ? ' is-selected' : ''}${guided ? ' is-guided' : ''}${affected ? ' is-affected' : ''}" type="button" draggable="${!locked}" data-piece-kind="ownership" data-piece-id="${serviceId}" aria-pressed="${isSelected}"${locked ? ' disabled' : ''}><span aria-hidden="true">◆</span>Owns ${service?.name || serviceId}</button></li>`;
    }).join('') || '<li class="empty-ownership">No formal service ownership</li>';
    const guided = tutorial && (isGuidedSource(scenario, 'team', team.id) || isGuidedTarget(scenario, 'team', team.id));

    return `
      <article class="lab-boundary team-boundary${guided ? ' is-guided' : ''}${affectedBoundary ? ' is-affected' : ''}" data-drop-kind="team" data-target-id="${team.id}">
        <button class="boundary-handle${selected ? ' is-selected' : ''}" type="button" draggable="${!locked}" data-piece-kind="team" data-piece-id="${team.id}" data-drop-kind="team" data-target-id="${team.id}" aria-pressed="${selected}"${locked ? ' disabled' : ''}>
          <span><small>Team</small>${team.name}</span><span aria-hidden="true">⠿</span>
        </button>
        <p class="boundary-section-label">Formal responsibility</p>
        <ul class="ownership-list">${ownership}</ul>
        <p class="boundary-section-label">People and actual changes</p>
        <ul class="people-list">${people || '<li class="empty-ownership">No people assigned</li>'}</ul>
      </article>
    `;
  }).join('');
  const newTeamGuided = tutorial && isGuidedTarget(scenario, 'new-team');

  return `
    <div class="lab-board" aria-label="Team topology workspace">
      <div class="boundary-grid team-grid">${cards}</div>
      <button class="new-boundary${newTeamGuided ? ' is-guided' : ''}" type="button" data-drop-kind="new-team"${locked ? ' disabled' : ''}>
        <span aria-hidden="true">＋</span><strong>New team</strong><small>Drop one ownership chip here to split its team</small>
      </button>
      ${renderTeamImpactMap(runtime)}
    </div>
  `;
};

const renderTeamEvidence = (state) => {
  const owners = state.services.map((service) => {
    const owner = state.teams.find((team) => team.owns.includes(service.id));
    return `<li><strong>${service.name}</strong><span>Owned by ${owner?.name || 'no team'}</span></li>`;
  }).join('');
  const contributionRows = state.people.flatMap((person) => {
    const team = state.teams.find((candidate) => candidate.people.includes(person.id));
    return Object.entries(person.contributions).map(([serviceId, count]) => ({ person, team, service: getServiceById(state, serviceId), count }));
  }).sort((left, right) => right.count - left.count).map(({ person, team, service, count }) => `
    <li><span><strong>${person.name}</strong><small>${team?.name || 'Unassigned'}</small></span><span><strong>${count}</strong><small>${service?.name || 'Unknown'} changes</small></span></li>
  `).join('');

  return `
    <div class="team-evidence">
      <div><p class="evidence-heading">Formal ownership</p><ul class="ownership-evidence">${owners}</ul></div>
      <div><p class="evidence-heading">What the Git history shows</p><ul class="contribution-evidence">${contributionRows}</ul></div>
    </div>
  `;
};

const renderLabMetrics = (runtime, scenario, architecture) => {
  const before = architecture
    ? getArchitectureMetrics(runtime.initialState, scenario.coChanges)
    : getTeamMetrics(runtime.initialState);

  if (!runtime.simulated) {
    const baseline = architecture
      ? `${before.coordination} cross-service changes · ${before.focus}% service focus`
      : `${before.handoffs} cross-team changes · ${before.alignment}% ownership alignment`;
    return `
      <div class="simulation-panel is-waiting">
        <div><p class="evidence-heading">Current release</p><strong>${baseline}</strong></div>
        <div><p>Redesign the board, then simulate to compare the next release with this baseline.</p><small class="simulation-disclaimer">Illustrative simulation based on change-history patterns.</small></div>
      </div>
    `;
  }

  const after = architecture
    ? getArchitectureMetrics(runtime.state, scenario.coChanges)
    : getTeamMetrics(runtime.state);
  const metrics = architecture
    ? [
      ['Coordination', before.coordination, after.coordination, 'Changes that cross service boundaries', 'lower'],
      ['Service focus', `${before.focus}%`, `${after.focus}%`, 'Responsibilities that match each service’s main job', 'higher'],
      ['Largest service', before.largest, after.largest, 'Responsibilities inside the biggest service', 'lower'],
      ['Boundaries', before.boundaries, after.boundaries, 'Services to deploy and operate', 'context'],
    ]
    : [
      ['Handoffs', before.handoffs, after.handoffs, 'Saved changes crossing team ownership', 'lower'],
      ['Ownership alignment', `${before.alignment}%`, `${after.alignment}%`, 'Work performed inside the owning team', 'higher'],
      ['Highest team load', before.load, after.load, 'People plus service scope one team keeps in mind', 'lower'],
      ['Teams', before.teams, after.teams, 'Formal team boundaries', 'context'],
    ];

  const renderMetricCard = ([label, oldValue, newValue, help, direction]) => {
    const oldNumber = Number.parseFloat(oldValue);
    const newNumber = Number.parseFloat(newValue);
    const improved = direction === 'lower' ? newNumber < oldNumber : direction === 'higher' ? newNumber > oldNumber : false;
    return `<div class="metric-card${improved ? ' is-improved' : ''}"><span>${label}</span><strong>${oldValue} <b aria-hidden="true">→</b> ${newValue}</strong><small>${help}</small></div>`;
  };
  const primaryCards = metrics.slice(0, 2).map(renderMetricCard).join('');
  const secondaryCards = metrics.slice(2).map(renderMetricCard).join('');

  const goalMet = scenario.expected
    ? true
    : architecture
      ? after.coordination <= scenario.goals.coordination && after.focus >= scenario.goals.focus && after.largest <= scenario.goals.largest
      : after.handoffs <= scenario.goals.handoffs && after.alignment >= scenario.goals.alignment && after.load <= scenario.goals.load;
  const improvedPrimary = architecture ? after.coordination < before.coordination : after.handoffs < before.handoffs;
  const narrative = scenario.expected
    ? scenario.result
    : goalMet
      ? 'This design meets the main goal and protects both guardrails. It is one defensible solution—not the only possible one.'
      : improvedPrimary
        ? 'Your design reduces boundary-crossing work, but at least one guardrail still needs attention. Keep editing or continue when the trade-off feels justified.'
        : 'This design changes the structure, but recurring work still crosses the same boundaries. Try a more targeted move, or accept the trade-off and compare again.';

  return `
    <section class="simulation-panel has-result" aria-live="polite">
      <div class="simulation-heading"><p class="evidence-heading">Next-release simulation</p><strong>${goalMet || scenario.expected ? 'What changed' : 'Trade-off check'}</strong></div>
      <div class="metric-grid">${primaryCards}</div>
      <details class="secondary-metrics">
        <summary>See structural trade-offs</summary>
        <div class="metric-grid">${secondaryCards}</div>
      </details>
      <p class="simulation-narrative">${narrative}</p>
      <p class="simulation-disclaimer">Illustrative simulation based on observed change patterns. It explains trade-offs; it does not predict a real release.</p>
    </section>
  `;
};

const selectedPieceName = (runtime) => {
  if (!runtime.selected) return '';
  const { kind, id } = runtime.selected;
  if (kind === 'service') return runtime.state.services.find((service) => service.id === id)?.name || id;
  if (kind === 'responsibility') return runtime.state.services.flatMap((service) => service.responsibilities).find((item) => item.id === id)?.label || id;
  if (kind === 'team') return runtime.state.teams.find((team) => team.id === id)?.name || id;
  if (kind === 'person') return getPersonById(runtime.state, id)?.name || id;
  if (kind === 'ownership') return `${getServiceById(runtime.state, id)?.name || id} ownership`;
  return id;
};

const matchesTutorialAction = (action, expected) => {
  if (action.type !== expected.type) return false;
  if (expected.pair) return [...expected.pair].sort().join('|') === [action.sourceId, action.targetId].sort().join('|');
  return action.sourceId === expected.sourceId && (!expected.targetId || action.targetId === expected.targetId);
};

const applyArchitectureAction = (state, action) => {
  if (action.type === 'merge-service') {
    if (action.sourceId === action.targetId) return null;
    const source = state.services.find((service) => service.id === action.sourceId);
    const target = state.services.find((service) => service.id === action.targetId);
    if (!source || !target) return null;
    target.responsibilities.push(...source.responsibilities);
    target.name = `${target.name} + ${source.name}`;
    state.services = state.services.filter((service) => service.id !== source.id);
    return `Merged ${source.name} into ${target.name.replace(` + ${source.name}`, '')}.`;
  }

  const source = state.services.find((service) => service.responsibilities.some((item) => item.id === action.sourceId));
  const responsibility = source?.responsibilities.find((item) => item.id === action.sourceId);
  if (!source || !responsibility) return null;

  if (action.type === 'move-responsibility') {
    const target = state.services.find((service) => service.id === action.targetId);
    if (!target || target.id === source.id) return null;
    source.responsibilities = source.responsibilities.filter((item) => item.id !== responsibility.id);
    target.responsibilities.push(responsibility);
    if (!source.responsibilities.length) state.services = state.services.filter((service) => service.id !== source.id);
    return `Moved ${responsibility.label} from ${source.name} to ${target.name}.`;
  }

  if (action.type === 'split-service') {
    if (source.responsibilities.length < 2) return null;
    source.responsibilities = source.responsibilities.filter((item) => item.id !== responsibility.id);
    state.services.push({ id: `new-${responsibility.id}`, name: responsibility.label, responsibilities: [responsibility] });
    return `Extracted ${responsibility.label} from ${source.name} into a new service.`;
  }

  return null;
};

const applyTeamAction = (state, action) => {
  if (action.type === 'merge-team') {
    if (action.sourceId === action.targetId) return null;
    const source = state.teams.find((team) => team.id === action.sourceId);
    const target = state.teams.find((team) => team.id === action.targetId);
    if (!source || !target) return null;
    target.people.push(...source.people.filter((personId) => !target.people.includes(personId)));
    target.owns.push(...source.owns.filter((serviceId) => !target.owns.includes(serviceId)));
    target.name = `${target.name} + ${source.name}`;
    state.teams = state.teams.filter((team) => team.id !== source.id);
    return `Merged ${source.name} into ${target.name.replace(` + ${source.name}`, '')}.`;
  }

  if (action.type === 'move-person') {
    const source = state.teams.find((team) => team.people.includes(action.sourceId));
    const target = state.teams.find((team) => team.id === action.targetId);
    const person = getPersonById(state, action.sourceId);
    if (!source || !target || !person || source.id === target.id) return null;
    source.people = source.people.filter((personId) => personId !== person.id);
    target.people.push(person.id);
    return `Moved ${person.name} from ${source.name} to ${target.name}.`;
  }

  if (action.type === 'transfer-ownership') {
    const source = state.teams.find((team) => team.owns.includes(action.sourceId));
    const target = state.teams.find((team) => team.id === action.targetId);
    const service = getServiceById(state, action.sourceId);
    if (!source || !target || !service || source.id === target.id) return null;
    source.owns = source.owns.filter((serviceId) => serviceId !== service.id);
    target.owns.push(service.id);
    return `Transferred ${service.name} ownership from ${source.name} to ${target.name}.`;
  }

  if (action.type === 'split-team') {
    const source = state.teams.find((team) => team.owns.includes(action.sourceId));
    const service = getServiceById(state, action.sourceId);
    if (!source || !service || source.owns.length < 2) return null;
    const strongestContributor = source.people
      .map((personId) => getPersonById(state, personId))
      .filter(Boolean)
      .sort((left, right) => (right.contributions[service.id] || 0) - (left.contributions[service.id] || 0))[0];
    const movedPeople = strongestContributor && (strongestContributor.contributions[service.id] || 0) > 0 ? [strongestContributor.id] : [];
    source.owns = source.owns.filter((serviceId) => serviceId !== service.id);
    source.people = source.people.filter((personId) => !movedPeople.includes(personId));
    state.teams.push({ id: `new-team-${service.id}`, name: `${service.name} team`, people: movedPeople, owns: [service.id] });
    return `Created a ${service.name} team${strongestContributor && movedPeople.length ? ` and moved ${strongestContributor.name} with the work` : ''}.`;
  }

  return null;
};

const actionFromDestination = (selected, destinationKind, destinationId) => {
  if (!selected) return null;
  if (selected.kind === 'service' && destinationKind === 'service') return { type: 'merge-service', sourceId: selected.id, targetId: destinationId };
  if (selected.kind === 'responsibility' && destinationKind === 'service') return { type: 'move-responsibility', sourceId: selected.id, targetId: destinationId };
  if (selected.kind === 'responsibility' && destinationKind === 'new-service') return { type: 'split-service', sourceId: selected.id };
  if (selected.kind === 'team' && destinationKind === 'team') return { type: 'merge-team', sourceId: selected.id, targetId: destinationId };
  if (selected.kind === 'person' && destinationKind === 'team') return { type: 'move-person', sourceId: selected.id, targetId: destinationId };
  if (selected.kind === 'ownership' && destinationKind === 'team') return { type: 'transfer-ownership', sourceId: selected.id, targetId: destinationId };
  if (selected.kind === 'ownership' && destinationKind === 'new-team') return { type: 'split-team', sourceId: selected.id };
  return null;
};

const performLabAction = (stage, runtime, action) => {
  const phase = getCurrentLabPhase(runtime);
  const scenario = getCurrentLabScenario(runtime);
  const tutorial = Boolean(phase.items);

  if (tutorial && !matchesTutorialAction(action, scenario.expected)) {
    runtime.status = 'This training step has one move to practise. Follow the highlighted instruction, then you can experiment freely in the mission.';
    runtime.selected = null;
    renderCouplingLab(stage);
    return;
  }

  const snapshot = { state: cloneLabState(runtime.state), actions: [...runtime.actions], strategyActions: [...runtime.strategyActions] };
  const description = isArchitecturePhase(phase)
    ? applyArchitectureAction(runtime.state, action)
    : applyTeamAction(runtime.state, action);

  if (!description) {
    runtime.status = 'That move would not change this board. Choose a different destination.';
    runtime.selected = null;
    renderCouplingLab(stage);
    return;
  }

  runtime.history.push(snapshot);
  runtime.actions.push(description);
  if (!tutorial) runtime.strategyActions.push(action.type);
  runtime.lastAction = action;
  runtime.selected = null;
  runtime.simulated = false;
  runtime.tutorialActionComplete = tutorial;
  runtime.status = `${description} Simulate the next release to see the effect.`;
  renderCouplingLab(stage);
};

const bindLabInteractions = (stage, runtime) => {
  const phase = getCurrentLabPhase(runtime);
  const scenario = getCurrentLabScenario(runtime);
  const tutorialLocked = Boolean(phase.items && runtime.tutorialActionComplete);

  const chooseDestination = (kind, id) => {
    if (tutorialLocked) return;
    const action = actionFromDestination(runtime.selected, kind, id);
    if (action) {
      performLabAction(stage, runtime, action);
    } else {
      runtime.status = runtime.selected
        ? `${selectedPieceName(runtime)} cannot be placed there. Use the action guide above the board.`
        : 'Select something on the board first, then choose its destination.';
      renderCouplingLab(stage);
    }
  };

  stage.querySelectorAll('[data-piece-kind]').forEach((piece) => {
    piece.addEventListener('click', (event) => {
      event.stopPropagation();
      const next = { kind: piece.dataset.pieceKind, id: piece.dataset.pieceId };
      const isContainer = ['service', 'team'].includes(next.kind);
      const isSame = runtime.selected?.kind === next.kind && runtime.selected?.id === next.id;
      if (runtime.selected && isContainer && !isSame) {
        chooseDestination(piece.dataset.dropKind, piece.dataset.targetId);
        return;
      }
      runtime.selected = isSame ? null : next;
      runtime.status = runtime.selected
        ? `${selectedPieceName(runtime)} selected. Now choose a destination.`
        : 'Selection cleared.';
      renderCouplingLab(stage);
    });

    piece.addEventListener('dragstart', (event) => {
      runtime.selected = { kind: piece.dataset.pieceKind, id: piece.dataset.pieceId };
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify(runtime.selected));
      piece.classList.add('is-dragging');
    });
  });

  stage.querySelectorAll('[data-drop-kind]').forEach((target) => {
    target.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      target.classList.add('is-drop-target');
    });
    target.addEventListener('dragleave', () => target.classList.remove('is-drop-target'));
    target.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      target.classList.remove('is-drop-target');
      try {
        const dragged = JSON.parse(event.dataTransfer.getData('text/plain'));
        if (dragged?.kind && dragged?.id) runtime.selected = dragged;
      } catch (error) {
        runtime.status = 'The drag could not be read. Select the item, then click its destination instead.';
      }
      chooseDestination(target.dataset.dropKind, target.dataset.targetId);
    });

    if (!target.dataset.pieceKind) {
      target.addEventListener('click', () => chooseDestination(target.dataset.dropKind, target.dataset.targetId));
    }
  });

  stage.querySelector('[data-lab-undo]')?.addEventListener('click', () => {
    const snapshot = runtime.history.pop();
    if (!snapshot) return;
    runtime.state = snapshot.state;
    runtime.actions = snapshot.actions;
    runtime.strategyActions = snapshot.strategyActions;
    runtime.selected = null;
    runtime.lastAction = null;
    runtime.simulated = false;
    runtime.tutorialActionComplete = false;
    runtime.status = 'Last move undone. The board is ready for another decision.';
    renderCouplingLab(stage);
  });

  stage.querySelector('[data-lab-reset]')?.addEventListener('click', () => {
    runtime.state = cloneLabState(runtime.initialState);
    runtime.history = [];
    runtime.actions = [];
    runtime.strategyActions = [...runtime.strategyActionsAtLoad];
    runtime.selected = null;
    runtime.lastAction = null;
    runtime.simulated = false;
    runtime.tutorialActionComplete = false;
    runtime.status = 'Board reset to the current-release structure.';
    renderCouplingLab(stage);
  });

  stage.querySelector('[data-lab-simulate]')?.addEventListener('click', () => {
    runtime.simulated = true;
    runtime.lastAction = null;
    runtime.status = 'Simulation complete. Compare the current and next-release measures below.';
    renderCouplingLab(stage);
    stage.querySelector('.simulation-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  stage.querySelector('[data-lab-next]')?.addEventListener('click', () => {
    if (phase.items && runtime.tutorialIndex < phase.items.length - 1) {
      runtime.tutorialIndex += 1;
    } else {
      runtime.phaseIndex += !runtime.guided && runtime.phaseIndex === 1 ? 2 : 1;
      runtime.tutorialIndex = 0;
    }
    if (runtime.phaseIndex >= couplingJourney.length) {
      renderCouplingLabResult(stage, runtime);
      return;
    }
    loadLabScenario(runtime);
    renderCouplingLab(stage);
    focusGameHeading(stage);
  });

  stage.querySelector('[data-lab-finish]')?.addEventListener('click', () => renderCouplingLabResult(stage, runtime, true));
};

const renderCouplingLab = (stage) => {
  const runtime = couplingLabState.get(stage);
  const phase = getCurrentLabPhase(runtime);
  const scenario = getCurrentLabScenario(runtime);
  const tutorial = Boolean(phase.items);
  const architecture = isArchitecturePhase(phase);
  const tutorialProgress = tutorial ? `<span>${runtime.tutorialIndex + 1} of ${phase.items.length} actions</span>` : '<span>No hints · any defensible solution</span>';
  const goals = scenario.objective
    ? `<div class="lab-mission-focus">
        <div><p class="evidence-heading">Your main goal</p><strong>${scenario.objective[0]}</strong></div>
        <details><summary>Keep two guardrails in mind</summary><ul>${scenario.objective.slice(1).map((goal) => `<li>${goal}</li>`).join('')}</ul></details>
      </div>`
    : '';
  const stakes = scenario.stakes ? `<div class="lab-stakes"><span>Release pressure</span><p>${scenario.stakes}</p></div>` : '';
  const lesson = tutorial ? `
    <div class="tutorial-callout">
      <p class="evidence-heading">Try this move</p>
      <p>${scenario.instruction}</p>
      <div><p><strong>Use it when</strong>${scenario.when}</p><p><strong>Watch the trade-off</strong>${scenario.tradeoff}</p></div>
    </div>
  ` : '';
  const evidence = architecture
    ? `<div class="lab-evidence"><p class="lab-evidence-note"><strong>How to read it:</strong> each row is one service; each dot is a saved change. A vertical line means the same change touched several services.</p>${renderHistoryGraph(scenario.history)}</div>`
    : renderTeamEvidence(runtime.initialState);
  const board = architecture
    ? renderArchitectureBoard(runtime, scenario, tutorial)
    : renderTeamBoard(runtime, scenario, tutorial);
  const tools = architecture
    ? renderArchitectureTools(scenario, tutorial)
    : renderTeamTools(scenario, tutorial);
  const showFullTerms = tutorial && runtime.tutorialIndex === 0;
  const terms = architecture ? renderArchitectureTerms(!showFullTerms) : renderTeamTerms(!showFullTerms);
  const howTo = runtime.phaseIndex === 0 && runtime.tutorialIndex === 0 ? `
    <div class="lab-howto" aria-label="How to play">
      <div><strong>1 · Select</strong><span>Tap or click a movable item. On a computer, you can drag it instead.</span></div>
      <div><strong>2 · Place</strong><span>Choose a destination on the board. The action guide shows what can move where.</span></div>
      <div><strong>3 · Compare</strong><span>Use Undo or Reset freely, then simulate the next release to reveal the impact.</span></div>
    </div>
  ` : '<p class="lab-howto-compact"><strong>Play:</strong> select or drag an item, place it on a destination, then simulate to reveal the impact.</p>';
  const actionTrail = runtime.actions.length
    ? `<div class="action-trail" aria-label="Moves made"><span>Moves:</span>${runtime.actions.map((action) => `<small>${action}</small>`).join('')}</div>`
    : '';
  const canSimulate = runtime.actions.length > 0 && (!tutorial || runtime.tutorialActionComplete);
  const phaseComplete = runtime.simulated;
  const nextLabel = tutorial && runtime.tutorialIndex < phase.items.length - 1
    ? 'Next training action'
    : runtime.phaseIndex === couplingJourney.length - 1
      ? 'Finish the lab'
      : !runtime.guided && runtime.phaseIndex === 1
        ? 'Continue to team mission'
      : `Continue to ${couplingJourney[runtime.phaseIndex + 1].label.toLowerCase()}`;
  const completionActions = !phaseComplete ? '' : runtime.phaseIndex === 3 ? `
    <div class="lab-completion-actions">
      <button class="game-button" type="button" data-lab-finish>See my strategy profile</button>
      <button class="lab-secondary-button" type="button" data-lab-next>Continue to optional challenges</button>
    </div>
  ` : `<button class="game-button game-next" type="button" data-lab-next>${nextLabel}</button>`;

  stage.innerHTML = `
    <div class="coupling-lab">
      ${renderLabJourney(runtime)}
      <div class="lab-title-row">
        <div><p class="game-scenario-label">${scenario.label}</p><h4 tabindex="-1" data-game-focus>${scenario.title}</h4><p>${scenario.brief}</p></div>
        ${tutorialProgress}
      </div>
      ${stakes}
      ${terms}
      ${goals}
      ${lesson}
      <section class="lab-workspace" aria-label="Interactive redesign workspace">
        <div class="workspace-heading"><div><p class="evidence-heading">1 · Read the evidence</p><h5>What repeatedly moves together?</h5></div><span>History, not guesswork</span></div>
        ${evidence}
        <div class="workspace-heading board-heading"><div><p class="evidence-heading">2 · Redesign the boundaries</p><h5>Move the work—not an answer option.</h5></div><span>Drag, or select then choose a destination</span></div>
        ${tools}
        ${howTo}
        <p class="lab-status" aria-live="polite">${runtime.status}</p>
        ${board}
        ${actionTrail}
        <div class="lab-controls">
          <button class="lab-secondary-button" type="button" data-lab-undo${runtime.history.length ? '' : ' disabled'}>Undo</button>
          <button class="lab-secondary-button" type="button" data-lab-reset${runtime.actions.length ? '' : ' disabled'}>Reset</button>
          <button class="game-button" type="button" data-lab-simulate${canSimulate ? '' : ' disabled'}>${runtime.simulated ? 'Simulate again' : 'Simulate next release'}</button>
        </div>
        ${renderLabMetrics(runtime, scenario, architecture)}
        ${completionActions}
      </section>
    </div>
  `;

  bindLabInteractions(stage, runtime);
  runtime.lastAction = null;
};

const getCouplingStrategyProfile = (actions) => {
  const counts = actions.reduce((result, action) => ({ ...result, [action]: (result[action] || 0) + 1 }), {});
  const approaches = [
    {
      label: 'Focused refactoring',
      score: (counts['move-responsibility'] || 0) + (counts['split-service'] || 0),
      description: 'You preferred moving the smallest meaningful piece of work, keeping most boundaries intact.',
      tradeoff: 'This preserves independence, but each extracted or relocated responsibility still needs a clear interface and owner.',
    },
    {
      label: 'Boundary simplification',
      score: (counts['merge-service'] || 0) + (counts['merge-team'] || 0),
      description: 'You reduced coordination by removing boundaries around work that repeatedly moves together.',
      tradeoff: 'Fewer handoffs can make delivery easier, while larger services or teams need their scope watched carefully.',
    },
    {
      label: 'Team realignment',
      score: (counts['move-person'] || 0) + (counts['transfer-ownership'] || 0) + (counts['split-team'] || 0),
      description: 'You brought formal responsibility closer to the people who actually perform the work.',
      tradeoff: 'Alignment improves, but team moves also transfer knowledge, relationships, access, and operational duties.',
    },
  ];
  const highest = Math.max(0, ...approaches.map((approach) => approach.score));
  const leaders = approaches.filter((approach) => approach.score === highest && highest > 0);
  if (leaders.length === 1) return { ...leaders[0], actionCount: actions.length };
  return {
    label: 'Balanced boundary designer',
    description: 'You combined structural and organizational moves instead of treating one kind of boundary as the whole problem.',
    tradeoff: 'A mixed strategy can fit the evidence well; its value depends on making every new boundary and responsibility explicit.',
    actionCount: actions.length,
  };
};

const renderCouplingLabResult = (stage, runtime, canExploreAdvanced = false) => {
  const profile = getCouplingStrategyProfile(runtime.strategyActions);
  stage.innerHTML = `
    <div class="game-result lab-result">
      <div class="game-result-mark" aria-hidden="true">↔</div>
      <p class="game-kicker">Your strategy profile · ${profile.actionCount} ${profile.actionCount === 1 ? 'move' : 'moves'}</p>
      <h4 tabindex="-1" data-game-focus>${profile.label}</h4>
      <p>${profile.description}</p>
      <div class="strategy-tradeoff"><strong>The trade-off to remember</strong><span>${profile.tradeoff}</span></div>
      <p class="lab-result-summary">Logical coupling reveals software that repeatedly changes together. Organizational coupling reveals when real work repeatedly crosses team ownership. Neither metric dictates one answer; both make trade-offs visible.</p>
      <div class="lab-result-actions">
        <button class="game-button" type="button" data-game-restart>Try another strategy</button>
        ${canExploreAdvanced ? '<button class="lab-secondary-button" type="button" data-lab-explore>Explore optional challenges</button>' : ''}
      </div>
    </div>
  `;
  stage.querySelector('[data-game-restart]').addEventListener('click', () => renderCouplingLabEntry(stage));
  stage.querySelector('[data-lab-explore]')?.addEventListener('click', () => {
    runtime.phaseIndex = 4;
    runtime.tutorialIndex = 0;
    loadLabScenario(runtime);
    renderCouplingLab(stage);
    focusGameHeading(stage);
  });
  focusGameHeading(stage);
};

const startCouplingLab = (stage, { guided = true } = {}) => {
  const runtime = { phaseIndex: guided ? 0 : 1, tutorialIndex: 0, guided, strategyActions: [] };
  couplingLabState.set(stage, runtime);
  loadLabScenario(runtime);
  renderCouplingLab(stage);
  focusGameHeading(stage);
};

const renderCouplingLabStory = (stage) => {
  clearCouplingStory(stage);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    renderCouplingLabEntry(stage);
    return;
  }

  stage.innerHTML = `
    <div class="lab-story" tabindex="-1" data-game-focus aria-label="A short story about hidden connections between microservices">
      <button class="lab-story-skip" type="button" data-story-skip>Skip intro</button>
      <div class="lab-story-frame" data-story-content role="status" aria-live="polite" aria-atomic="true"></div>
      <div class="lab-story-progress" aria-hidden="true"><span data-story-progress></span></div>
    </div>
  `;

  let sceneIndex = 0;
  const content = stage.querySelector('[data-story-content]');
  const progress = stage.querySelector('[data-story-progress]');

  const showScene = () => {
    const scene = couplingStoryScenes[sceneIndex];
    content.innerHTML = `
      <div class="lab-story-scene">
        <p>${scene.kicker}</p>
        <h4>${scene.line}</h4>
        <strong>${scene.accent}</strong>
      </div>
    `;
    progress.style.width = `${((sceneIndex + 1) / couplingStoryScenes.length) * 100}%`;
    const timer = window.setTimeout(() => {
      sceneIndex += 1;
      if (sceneIndex >= couplingStoryScenes.length) {
        renderCouplingLabEntry(stage);
      } else {
        showScene();
      }
    }, scene.duration);
    couplingStoryTimers.set(stage, timer);
  };

  stage.querySelector('[data-story-skip]').addEventListener('click', () => renderCouplingLabEntry(stage));
  showScene();
  focusGameHeading(stage);
};

const renderCouplingLabEntry = (stage) => {
  clearCouplingStory(stage);
  stage.innerHTML = `
    <div class="lab-entry">
      <div class="lab-entry-heading">
        <p class="game-kicker">Choose your route</p>
        <h4 tabindex="-1" data-game-focus>Redesign what changes together.</h4>
        <p>No software-engineering background is required. The evidence comes from saved code changes; you decide where the service and team boundaries should go.</p>
      </div>
      <div class="lab-entry-chapters" aria-label="Coupling Lab chapters">
        <article><span>Chapter 1</span><strong>Service boundaries</strong><p>Spot separate programs that repeatedly need the same changes, then reorganize their responsibilities.</p></article>
        <article><span>Chapter 2</span><strong>Team boundaries</strong><p>Compare formal ownership with who actually changes the code, then realign people or responsibility.</p></article>
      </div>
      <div class="lab-entry-actions">
        <button class="game-button" type="button" data-lab-entry-guided><strong>Start guided tutorial</strong><span>Learn every move, then play both missions</span></button>
        <button class="lab-secondary-button" type="button" data-lab-entry-mission><strong>I know the basics — start the mission</strong><span>Skip practice and solve both boards</span></button>
      </div>
      <p class="lab-entry-optional"><strong>Optional after the two missions:</strong> two advanced cases with noisier evidence and more ambiguous trade-offs.</p>
    </div>
  `;
  stage.querySelector('[data-lab-entry-guided]').addEventListener('click', () => startCouplingLab(stage));
  stage.querySelector('[data-lab-entry-mission]').addEventListener('click', () => startCouplingLab(stage, { guided: false }));
  focusGameHeading(stage);
};

const renderTestingResult = (stage, score) => {
  const message = score >= 8
    ? 'Excellent selection: high relevance, low latency, and no wasted feedback time.'
    : score >= 5
      ? 'A solid test strategy. Tightening the impact trace would save a little more time.'
      : 'You protected coverage, but the suite can be more selective. Follow the changed dependencies first.';

  stage.innerHTML = `
    <div class="game-result">
      <div class="game-result-mark" aria-hidden="true">${score}/9</div>
      <h4 tabindex="-1" data-game-focus>Pipeline complete.</h4>
      <p>${message}</p>
      <button class="game-button" type="button" data-game-restart>Build another suite</button>
    </div>
  `;
  stage.querySelector('[data-game-restart]').addEventListener('click', () => renderTestingRound(stage, 0, 0));
  focusGameHeading(stage);
};

const renderTestingRound = (stage, roundIndex, score) => {
  const round = testingRounds[roundIndex];
  const testItems = round.tests.map(([name, duration], index) => `
    <li class="test-option">
      <label>
        <input type="checkbox" value="${index}" data-test-option>
        <span>${name}</span>
        <span>${duration}s</span>
      </label>
    </li>
  `).join('');

  stage.innerHTML = `
    <form class="game-round" data-test-form>
      ${renderProgress(roundIndex, testingRounds.length, score, testingRounds.length * 3)}
      <p class="game-scenario-label">${round.label}</p>
      <div class="change-brief">${round.brief}</div>
      ${renderImpactGraph(round.impactPath)}
      <fieldset class="test-fieldset">
        <legend class="game-question" tabindex="-1" data-game-focus>Which tests should run?</legend>
        <div class="budget-row">
          <span>Budget: ${round.budget}s</span>
          <span class="budget-value" data-budget-value aria-live="polite">Selected: 0s</span>
        </div>
        <ul class="test-list">${testItems}</ul>
      </fieldset>
      <button class="game-button" type="submit" data-test-submit disabled>Run selected tests</button>
      <div aria-live="polite" data-game-feedback></div>
    </form>
  `;

  const form = stage.querySelector('[data-test-form]');
  const inputs = [...stage.querySelectorAll('[data-test-option]')];
  const budgetValue = stage.querySelector('[data-budget-value]');
  const submitButton = stage.querySelector('[data-test-submit]');
  const feedback = stage.querySelector('[data-game-feedback]');

  const updateBudget = () => {
    const duration = inputs.reduce((total, input) => total + (input.checked ? round.tests[Number(input.value)][1] : 0), 0);
    budgetValue.textContent = `Selected: ${duration}s`;
    budgetValue.classList.toggle('is-over', duration > round.budget);
    submitButton.disabled = !inputs.some((input) => input.checked);
  };

  inputs.forEach((input) => input.addEventListener('change', updateBudget));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = inputs.filter((input) => input.checked).map((input) => Number(input.value));
    const duration = selected.reduce((total, index) => total + round.tests[index][1], 0);
    const relevantSelected = selected.filter((index) => round.tests[index][2]).length;
    const unnecessarySelected = selected.filter((index) => !round.tests[index][2]).length;
    const overBudget = duration > round.budget;
    const roundScore = Math.max(0, relevantSelected - unnecessarySelected - (overBudget ? 1 : 0));
    const nextScore = score + roundScore;
    const resultLead = roundScore === 3 ? 'Optimal selection.' : roundScore >= 2 ? 'Good coverage.' : 'The signal is noisy.';

    inputs.forEach((input) => { input.disabled = true; });
    submitButton.remove();
    feedback.innerHTML = `
        <p class="game-feedback"><strong>${resultLead} +${roundScore} ${roundScore === 1 ? 'point' : 'points'}.</strong> ${round.explanation}${overBudget ? ` Your ${duration}-second selection exceeded the budget.` : ''}${unnecessarySelected ? ` ${unnecessarySelected} unrelated ${unnecessarySelected === 1 ? 'test added' : 'tests added'} avoidable delay.` : ''}</p>
      <button class="game-button game-next" type="button" data-game-next>${roundIndex === testingRounds.length - 1 ? 'See result' : 'Next change'}</button>
    `;
    const nextButton = feedback.querySelector('[data-game-next]');
    nextButton.addEventListener('click', () => {
      if (roundIndex === testingRounds.length - 1) {
        renderTestingResult(stage, nextScore);
      } else {
        renderTestingRound(stage, roundIndex + 1, nextScore);
        focusGameHeading(stage);
      }
    });
    nextButton.focus();
  });

  focusGameHeading(stage);
};

document.querySelectorAll('[data-game]').forEach((game) => {
  const stage = game.querySelector('[data-game-stage]');
  const startButton = game.querySelector('[data-game-start]');
  if (!stage || !startButton) return;

  startButton.addEventListener('click', () => {
    if (game.dataset.game === 'coupling') {
      renderCouplingLabStory(stage);
    } else if (game.dataset.game === 'testing') {
      renderTestingRound(stage, 0, 0);
    }
  });
});
