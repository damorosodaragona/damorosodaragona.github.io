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
    label: 'Round 1 · Pricing guard',
    title: 'Stop a discount from producing a negative total.',
    ticket: 'The requested change is in <code>applyDiscount()</code>. Find and click that production method.',
    targetMethod: 'apply-discount',
    fullSuiteTests: 345,
    fullSuiteDuration: 1200,
    methods: [
      { id: 'cart-subtotal', name: 'cartSubtotal()', area: 'Cart', summary: 'Adds the prices in the basket.' },
      { id: 'apply-discount', name: 'applyDiscount()', area: 'Pricing', summary: 'Subtracts a coupon from the subtotal.' },
      { id: 'calculate-tax', name: 'calculateTax()', area: 'Pricing', summary: 'Calculates tax for the final price.' },
      { id: 'reserve-stock', name: 'reserveStock()', area: 'Inventory', summary: 'Reserves the purchased items.' },
      { id: 'send-receipt', name: 'sendReceipt()', area: 'Email', summary: 'Sends the purchase receipt.' },
      { id: 'load-profile', name: 'loadProfile()', area: 'Account', summary: 'Loads a customer profile.' },
      { id: 'write-audit', name: 'writeAuditLog()', area: 'Platform', summary: 'Records an operational event.' },
    ],
    diff: {
      before: 'return subtotal - discount;',
      after: 'return Math.max(0, subtotal - discount);',
      explanation: 'The price can no longer fall below zero. Any test that calls this method could detect a regression.',
    },
    tests: [
      { id: 'profile-loads', name: 'profile_preferences_load()', duration: 14, touches: ['load-profile'] },
      { id: 'discount-applied', name: 'discount_is_applied()', duration: 16, touches: ['apply-discount'] },
      { id: 'audit-written', name: 'audit_event_is_written()', duration: 11, touches: ['write-audit'] },
      { id: 'checkout-coupon', name: 'checkout_total_with_coupon()', duration: 28, touches: ['cart-subtotal', 'apply-discount', 'calculate-tax'] },
      { id: 'stock-reserved', name: 'stock_is_reserved()', duration: 18, touches: ['reserve-stock'] },
      { id: 'negative-total', name: 'negative_total_guard()', duration: 12, touches: ['apply-discount'] },
      { id: 'receipt-total', name: 'receipt_contains_total()', duration: 22, touches: ['cart-subtotal', 'send-receipt'] },
    ],
    resultExplanation: 'These three tests call the changed method directly. Their positions are deliberately mixed with unrelated tests.',
  },
  {
    label: 'Round 2 · Stock reservation',
    title: 'Prevent two customers from reserving the last item.',
    ticket: 'The requested change is in <code>reserveStock()</code>. Find and click that production method.',
    targetMethod: 'reserve-stock',
    fullSuiteTests: 345,
    fullSuiteDuration: 1200,
    methods: [
      { id: 'load-cart', name: 'loadCart()', area: 'Cart', summary: 'Loads the current basket.' },
      { id: 'apply-discount', name: 'applyDiscount()', area: 'Pricing', summary: 'Applies a coupon to the order.' },
      { id: 'reserve-stock', name: 'reserveStock()', area: 'Inventory', summary: 'Locks stock for one purchase.' },
      { id: 'confirm-payment', name: 'confirmPayment()', area: 'Payments', summary: 'Confirms a completed payment.' },
      { id: 'create-order', name: 'createOrder()', area: 'Orders', summary: 'Creates the customer order.' },
      { id: 'send-receipt', name: 'sendReceipt()', area: 'Email', summary: 'Sends the purchase receipt.' },
      { id: 'load-profile', name: 'loadProfile()', area: 'Account', summary: 'Loads a customer profile.' },
    ],
    diff: {
      before: 'stock[item] -= quantity;',
      after: 'stock[item] = reserveAtomically(item, quantity);',
      explanation: 'The reservation now happens as one safe operation. Tests that call reserveStock() can reveal whether two purchases still collide.',
    },
    tests: [
      { id: 'coupon-total', name: 'coupon_changes_total()', duration: 13, touches: ['load-cart', 'apply-discount'] },
      { id: 'last-item', name: 'last_item_has_one_winner()', duration: 34, touches: ['reserve-stock', 'create-order'] },
      { id: 'payment-confirmed', name: 'payment_is_confirmed()', duration: 19, touches: ['confirm-payment'] },
      { id: 'receipt-sent', name: 'receipt_is_sent()', duration: 17, touches: ['send-receipt'] },
      { id: 'single-reservation', name: 'single_item_is_reserved()', duration: 14, touches: ['reserve-stock'] },
      { id: 'profile-loads', name: 'profile_is_loaded()', duration: 12, touches: ['load-profile'] },
      { id: 'checkout-stock', name: 'checkout_reserves_stock()', duration: 27, touches: ['load-cart', 'reserve-stock', 'confirm-payment', 'create-order'] },
    ],
    resultExplanation: 'A focused unit test and two broader flows reach reserveStock(). Other checkout tests do not automatically become relevant.',
  },
  {
    label: 'Round 3 · Indirect calls',
    title: 'Follow a change through methods that call other methods.',
    ticket: 'The requested change is in <code>roundMoney()</code>. Find and click that production method.',
    targetMethod: 'round-money',
    fullSuiteTests: 345,
    fullSuiteDuration: 1200,
    methods: [
      { id: 'round-money', name: 'roundMoney()', area: 'Money', summary: 'Rounds a monetary value.' },
      { id: 'calculate-total', name: 'calculateTotal()', area: 'Checkout', summary: 'Builds the final checkout total.', calls: ['round-money'] },
      { id: 'invoice-total', name: 'invoiceTotal()', area: 'Billing', summary: 'Builds an invoice total.', calls: ['calculate-total'] },
      { id: 'cart-preview', name: 'cartPreview()', area: 'Cart', summary: 'Shows the current total.', calls: ['calculate-total'] },
      { id: 'reserve-stock', name: 'reserveStock()', area: 'Inventory', summary: 'Reserves purchased items.' },
      { id: 'search-products', name: 'searchProducts()', area: 'Catalog', summary: 'Finds products in the catalog.' },
      { id: 'send-email', name: 'sendEmail()', area: 'Email', summary: 'Sends a customer message.' },
    ],
    diff: {
      before: 'return Math.round(value * 100) / 100;',
      after: 'return value.setScale(2, HALF_EVEN);',
      explanation: 'The rounding rule changed. A test can reach it directly or through another production method.',
    },
    tests: [
      { id: 'catalog-search', name: 'catalog_search_returns_items()', duration: 17, touches: ['search-products'] },
      { id: 'invoice-rounding', name: 'invoice_uses_bankers_rounding()', duration: 29, touches: ['invoice-total'] },
      { id: 'stock-reserved', name: 'stock_is_reserved()', duration: 14, touches: ['reserve-stock'] },
      { id: 'checkout-rounding', name: 'checkout_total_is_rounded()', duration: 23, touches: ['calculate-total'] },
      { id: 'email-sent', name: 'confirmation_email_is_sent()', duration: 16, touches: ['send-email'] },
      { id: 'cart-rounding', name: 'cart_preview_matches_total()', duration: 20, touches: ['cart-preview'] },
      { id: 'search-empty', name: 'empty_search_is_handled()', duration: 12, touches: ['search-products'] },
    ],
    resultExplanation: 'None of the three impacted tests calls roundMoney() directly. Their paths go through calculateTotal(), sometimes through another method first.',
  },
  {
    label: 'Round 4 · Test lifecycle',
    title: 'Remember what JUnit runs around each selected test.',
    ticket: 'The requested change is in <code>seedAccount()</code>. Find and click that production method.',
    targetMethod: 'seed-account',
    fullSuiteTests: 345,
    fullSuiteDuration: 1200,
    methods: [
      { id: 'seed-account', name: 'seedAccount()', area: 'Accounts', summary: 'Creates temporary account data.' },
      { id: 'update-email', name: 'updateEmail()', area: 'Accounts', summary: 'Updates an account email.' },
      { id: 'delete-account', name: 'deleteAccount()', area: 'Accounts', summary: 'Deletes an account.' },
      { id: 'clear-temp', name: 'clearTempData()', area: 'Accounts', summary: 'Removes temporary data.' },
      { id: 'export-orders', name: 'exportOrders()', area: 'Orders', summary: 'Exports order history.' },
      { id: 'filter-catalog', name: 'filterCatalog()', area: 'Catalog', summary: 'Filters catalog items.' },
      { id: 'send-receipt', name: 'sendReceipt()', area: 'Email', summary: 'Sends a receipt.' },
    ],
    diff: {
      before: 'account.status = ACTIVE;',
      after: 'account.activate(clock.now());',
      explanation: 'The shared account fixture changed. Trace both normal test calls and automatic lifecycle calls.',
    },
    tests: [
      { id: 'orders-export', name: 'orders_can_be_exported()', duration: 18, touches: ['export-orders'] },
      { id: 'email-update', name: 'email_can_be_updated()', duration: 22, touches: ['update-email'], hooks: ['account-setup', 'account-teardown'] },
      { id: 'account-setup', name: '@BeforeEach setUpAccount()', automatic: true, touches: ['seed-account'] },
      { id: 'catalog-filter', name: 'catalog_can_be_filtered()', duration: 14, touches: ['filter-catalog'] },
      { id: 'account-teardown', name: '@AfterEach tearDownAccount()', automatic: true, touches: ['clear-temp'] },
      { id: 'account-delete', name: 'account_can_be_deleted()', duration: 24, touches: ['delete-account'], hooks: ['account-setup', 'account-teardown'] },
      { id: 'receipt-sent', name: 'receipt_is_sent()', duration: 13, touches: ['send-receipt'] },
    ],
    resultExplanation: 'The two selected tests do not call seedAccount() themselves. JUnit runs @BeforeEach before each of them, so the fixture creates the missing path. Lifecycle nodes are automatic, not selectable.',
  },
  {
    label: 'Round 5 · Cosmetic change',
    title: 'Decide whether a code edit can change behaviour at all.',
    ticket: 'A maintenance edit was made inside <code>calculateShipping()</code>. Find and click that production method.',
    targetMethod: 'calculate-shipping',
    semanticImpact: false,
    fullSuiteTests: 345,
    fullSuiteDuration: 1200,
    methods: [
      { id: 'calculate-shipping', name: 'calculateShipping()', area: 'Delivery', summary: 'Calculates the delivery price.' },
      { id: 'checkout-total', name: 'checkoutTotal()', area: 'Checkout', summary: 'Builds the checkout total.', calls: ['calculate-shipping'] },
      { id: 'express-price', name: 'expressPrice()', area: 'Delivery', summary: 'Shows the express price.', calls: ['calculate-shipping'] },
      { id: 'reserve-stock', name: 'reserveStock()', area: 'Inventory', summary: 'Reserves purchased items.' },
      { id: 'load-profile', name: 'loadProfile()', area: 'Account', summary: 'Loads customer details.' },
      { id: 'send-receipt', name: 'sendReceipt()', area: 'Email', summary: 'Sends a receipt.' },
      { id: 'apply-tax', name: 'applyTax()', area: 'Pricing', summary: 'Adds tax to a price.' },
    ],
    diff: {
      before: 'double x = weight * rate;',
      after: 'double shippingCost = weight * rate;',
      explanation: 'The implementation now uses a clearer local variable name. Decide what that means for test execution.',
    },
    tests: [
      { id: 'shipping-price', name: 'shipping_price_is_calculated()', duration: 16, touches: ['calculate-shipping'] },
      { id: 'profile-loads', name: 'profile_is_loaded()', duration: 12, touches: ['load-profile'] },
      { id: 'receipt-sent', name: 'receipt_is_sent()', duration: 15, touches: ['send-receipt'] },
      { id: 'checkout-shipping', name: 'checkout_includes_shipping()', duration: 25, touches: ['checkout-total'] },
      { id: 'tax-applied', name: 'tax_is_applied()', duration: 14, touches: ['apply-tax'] },
      { id: 'stock-reserved', name: 'stock_is_reserved()', duration: 13, touches: ['reserve-stock'] },
      { id: 'express-shipping', name: 'express_shipping_is_priced()', duration: 21, touches: ['express-price'] },
    ],
    resultExplanation: 'The bytecode-normalized behaviour is unchanged: only a local variable name changed. CATTO ignores this cosmetic edit, so the smallest safe set contains zero tests.',
  },
  {
    label: 'Bonus · Java hierarchy',
    title: 'Trace a superclass call without confusing it with static hiding.',
    ticket: 'The requested change is in <code>BaseFormatter.format()</code>. Find and click that production method.',
    targetMethod: 'base-format',
    fullSuiteTests: 345,
    fullSuiteDuration: 1200,
    methods: [
      { id: 'base-format', name: 'BaseFormatter.format()', area: 'Superclass', summary: 'Formats a base document.' },
      { id: 'invoice-format', name: 'InvoiceFormatter.format()', area: 'Subclass', summary: 'Extends the base format.', calls: ['base-format'], relation: 'super.format()' },
      { id: 'receipt-format', name: 'ReceiptFormatter.format()', area: 'Subclass', summary: 'Replaces the base format without calling super.' },
      { id: 'base-label', name: 'BaseFormatter.label()', area: 'Superclass · static', summary: 'Returns the base static label.' },
      { id: 'invoice-label', name: 'InvoiceFormatter.label()', area: 'Subclass · static', summary: 'Hides the base static label.' },
      { id: 'export-document', name: 'exportDocument()', area: 'Documents', summary: 'Exports a formatted document.', calls: ['invoice-format'] },
      { id: 'send-document', name: 'sendDocument()', area: 'Email', summary: 'Sends a document.' },
    ],
    diff: {
      before: 'return header + body;',
      after: 'return header + sanitize(body);',
      explanation: 'The superclass implementation changed. Follow explicit super calls and keep static methods separate.',
    },
    tests: [
      { id: 'receipt-format-test', name: 'receipt_is_formatted()', duration: 15, touches: ['receipt-format'] },
      { id: 'invoice-export-test', name: 'invoice_export_is_formatted()', duration: 27, touches: ['export-document'] },
      { id: 'invoice-static-label', name: 'invoice_static_label_is_used()', duration: 12, touches: ['invoice-label'] },
      { id: 'base-format-test', name: 'base_document_is_formatted()', duration: 18, touches: ['base-format'] },
      { id: 'mail-test', name: 'document_email_is_sent()', duration: 14, touches: ['send-document'] },
      { id: 'base-static-label', name: 'base_static_label_is_used()', duration: 11, touches: ['base-label'] },
      { id: 'receipt-static-check', name: 'receipt_label_is_stable()', duration: 13, touches: ['invoice-label'] },
    ],
    resultExplanation: 'invoice_export_is_formatted() reaches BaseFormatter.format() through super.format(); the direct base test is also relevant. ReceiptFormatter replaces the method without calling super. Static label methods are hidden, not overridden, and do not reach this instance-method change.',
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

const formatTestingDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
};

const getSelectableTests = (round) => round.tests.filter((test) => !test.automatic);

const findMethodPath = (round, fromId, targetId, visited = new Set()) => {
  if (fromId === targetId) return [fromId];
  if (visited.has(fromId)) return null;
  const nextVisited = new Set(visited).add(fromId);
  const method = round.methods.find((item) => item.id === fromId);
  if (!method) return null;

  for (const calledId of method.calls || []) {
    const path = findMethodPath(round, calledId, targetId, nextVisited);
    if (path) return [fromId, ...path];
  }
  return null;
};

const getTestStartMethods = (round, test) => {
  const hookMethods = (test.hooks || []).flatMap((hookId) => (
    round.tests.find((item) => item.id === hookId)?.touches || []
  ));
  return [...new Set([...(test.touches || []), ...hookMethods])];
};

const getTestImpactPaths = (round, test) => {
  if (round.semanticImpact === false || test.automatic) return [];
  return getTestStartMethods(round, test)
    .map((methodId) => findMethodPath(round, methodId, round.targetMethod))
    .filter(Boolean);
};

const isTestImpacted = (round, test) => getTestImpactPaths(round, test).length > 0;

const getReachableCallPairs = (round, startIds) => {
  const pairs = new Set();
  const visited = new Set();
  const visit = (methodId) => {
    if (visited.has(methodId)) return;
    visited.add(methodId);
    const method = round.methods.find((item) => item.id === methodId);
    (method?.calls || []).forEach((calledId) => {
      pairs.add(`${methodId}|${calledId}`);
      visit(calledId);
    });
  };
  startIds.forEach(visit);
  return pairs;
};

const renderMethodTestGraph = (round) => {
  const rowHeight = 72;
  const rowCount = Math.max(round.methods.length, round.tests.length);
  const height = rowCount * rowHeight;
  const methodIndex = Object.fromEntries(round.methods.map((method, index) => [method.id, index]));
  const methodNames = Object.fromEntries(round.methods.map((method) => [method.id, method.name]));
  const testIndex = Object.fromEntries(round.tests.map((test, index) => [test.id, index]));
  const directEdges = round.tests.flatMap((test, testRow) => (test.touches || []).map((methodId) => {
    const methodRow = methodIndex[methodId];
    const methodY = (methodRow * rowHeight) + (rowHeight / 2);
    const testY = (testRow * rowHeight) + (rowHeight / 2);
    return `<path class="method-test-edge${test.automatic ? ' is-automatic-edge' : ''}" data-edge-test="${test.id}" data-edge-method="${methodId}" d="M 0 ${methodY} C 58 ${methodY}, 122 ${testY}, 180 ${testY}"></path>`;
  })).join('');
  const methodCallEdges = round.methods.flatMap((method, methodRow) => (method.calls || []).map((calledId) => {
    const calledRow = methodIndex[calledId];
    const fromY = (methodRow * rowHeight) + (rowHeight / 2);
    const toY = (calledRow * rowHeight) + (rowHeight / 2);
    return `<path class="production-call-edge" data-call-from="${method.id}" data-call-to="${calledId}" d="M 0 ${fromY} C 48 ${fromY}, 48 ${toY}, 0 ${toY}"></path>`;
  })).join('');
  const lifecycleEdges = round.tests.flatMap((test, testRow) => (test.hooks || []).map((hookId) => {
    const hookRow = testIndex[hookId];
    const fromY = (testRow * rowHeight) + (rowHeight / 2);
    const toY = (hookRow * rowHeight) + (rowHeight / 2);
    return `<path class="test-lifecycle-edge" data-edge-test="${test.id}" data-edge-hook="${hookId}" d="M 180 ${fromY} C 132 ${fromY}, 132 ${toY}, 180 ${toY}"></path>`;
  })).join('');
  const methodNodes = round.methods.map((method) => `
    <button class="production-method" type="button" data-production-method="${method.id}" aria-label="Production method ${method.name}. ${method.summary}">
      <span>${method.area}${method.calls?.length ? ` · ${method.relation || `calls ${method.calls.map((id) => methodNames[id]).join(' + ')}`}` : ''}</span>
      <strong>${method.name}</strong>
    </button>
  `).join('');
  const testNodes = round.tests.map((test) => test.automatic ? `
    <button class="test-method is-automatic" type="button" data-test-hook="${test.id}" disabled>
      <span>Runs automatically · lifecycle</span>
      <strong>${test.name}</strong>
    </button>
  ` : `
    <button class="test-method" type="button" data-test-method="${test.id}" aria-pressed="false" disabled>
      <span>${test.duration}s · calls ${test.touches.length} ${test.touches.length === 1 ? 'method' : 'methods'}${test.hooks?.length ? ' + lifecycle' : ''}</span>
      <strong>${test.name}</strong>
    </button>
  `).join('');
  const hasIndirectCalls = round.methods.some((method) => method.calls?.length);
  const hasLifecycle = round.tests.some((test) => test.automatic);

  return `
    <section class="method-test-panel" aria-labelledby="method-test-title">
      <div class="method-test-heading">
        <div>
          <p class="game-scenario-label">Code map</p>
          <h5 id="method-test-title">Which test paths can reach the changed method?</h5>
        </div>
        <div class="method-test-legend" aria-label="Definitions">
          <span><strong>Production method</strong> code used by the application</span>
          <span><strong>Test method</strong> an automated check that calls production code</span>
        </div>
      </div>
      ${(hasIndirectCalls || hasLifecycle) ? `
        <div class="method-test-path-legend" aria-label="Path types">
          <span class="is-direct">Test calls production</span>
          ${hasIndirectCalls ? '<span class="is-indirect">Production method calls another method</span>' : ''}
          ${hasLifecycle ? '<span class="is-lifecycle">JUnit runs this lifecycle path automatically</span>' : ''}
        </div>
      ` : ''}
      <p class="method-test-mobile-hint">Swipe sideways to explore the complete map.</p>
      <div class="method-test-scroll">
        <div class="method-test-graph" style="--graph-rows: ${rowCount}">
          <div class="method-test-column method-column">
            <p>Production methods</p>
            <div class="method-test-nodes">${methodNodes}</div>
          </div>
          <svg class="method-test-lines" viewBox="0 0 180 ${height}" preserveAspectRatio="none" aria-hidden="true">${directEdges}${methodCallEdges}${lifecycleEdges}</svg>
          <div class="method-test-column test-column">
            <p>Test methods</p>
            <div class="method-test-nodes">${testNodes}</div>
          </div>
        </div>
      </div>
    </section>
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

const testingStoryTimers = new WeakMap();

const testingStoryScenes = [
  { kicker: 'A tiny change', line: 'Alex edits half a line of production code.', accent: 'The fix takes seconds.', duration: 2200 },
  { kicker: 'The pipeline wakes up', line: '345 automated tests start running.', accent: 'Every test. Every time.', duration: 2200 },
  { kicker: 'Estimated wait', line: '20 minutes.', accent: 'For half a line.', duration: 2400 },
  { kicker: 'The next day', line: 'Another tiny change. Another full pipeline.', accent: 'Alex waits again.', duration: 2400 },
  { kicker: 'The real question', line: 'Did all 345 tests need to run?', accent: 'Or only the tests that touch the change?', duration: 3000 },
  { kicker: 'Your turn', line: 'Trace the change.', accent: 'Run the smallest safe test set.', duration: 2600 },
];

const newTestingProgress = () => ({ score: 0, safeRounds: 0, totalDuration: 0, totalBaseline: 0 });

const clearTestingStory = (stage) => {
  const timer = testingStoryTimers.get(stage);
  if (timer) window.clearTimeout(timer);
  testingStoryTimers.delete(stage);
};

const renderTestingStory = (stage) => {
  clearTestingStory(stage);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    renderTestingRound(stage, 0, newTestingProgress());
    return;
  }

  stage.innerHTML = `
    <div class="lab-story pipeline-story" tabindex="-1" data-game-focus aria-label="A short story about a developer waiting for an unnecessarily large test suite">
      <button class="lab-story-skip" type="button" data-story-skip>Skip intro</button>
      <div class="lab-story-frame" data-story-content role="status" aria-live="polite" aria-atomic="true"></div>
      <div class="lab-story-progress" aria-hidden="true"><span data-story-progress></span></div>
    </div>
  `;

  let sceneIndex = 0;
  const content = stage.querySelector('[data-story-content]');
  const progress = stage.querySelector('[data-story-progress]');

  const startChallenge = () => {
    clearTestingStory(stage);
    renderTestingRound(stage, 0, newTestingProgress());
  };
  const showScene = () => {
    const scene = testingStoryScenes[sceneIndex];
    content.innerHTML = `
      <div class="lab-story-scene">
        <p>${scene.kicker}</p>
        <h4>${scene.line}</h4>
        <strong>${scene.accent}</strong>
      </div>
    `;
    progress.style.width = `${((sceneIndex + 1) / testingStoryScenes.length) * 100}%`;
    const timer = window.setTimeout(() => {
      sceneIndex += 1;
      if (sceneIndex >= testingStoryScenes.length) startChallenge();
      else showScene();
    }, scene.duration);
    testingStoryTimers.set(stage, timer);
  };

  stage.querySelector('[data-story-skip]').addEventListener('click', startChallenge);
  showScene();
  focusGameHeading(stage);
};

const renderTestingResult = (stage, progress) => {
  const saved = progress.totalBaseline - progress.totalDuration;
  const safeEveryTime = progress.safeRounds === testingRounds.length;
  const message = safeEveryTime
    ? 'You kept every impacted test and removed the waiting that added no protection.'
    : 'You made the pipeline faster, but speed only helps when every test that can detect the change is still included.';

  stage.innerHTML = `
    <div class="game-result testing-result">
      <div class="game-result-mark" aria-hidden="true">${progress.safeRounds}/${testingRounds.length}</div>
      <p class="game-scenario-label">Pipeline complete</p>
      <h4 tabindex="-1" data-game-focus>${safeEveryTime ? 'Fast and safe.' : 'Fast, with a safety gap.'}</h4>
      <p>${message}</p>
      <div class="testing-result-metrics">
        <div><span>Safe selections</span><strong>${progress.safeRounds} of ${testingRounds.length}</strong></div>
        <div><span>Selected test time</span><strong>${formatTestingDuration(progress.totalDuration)}</strong></div>
        <div><span>Time saved</span><strong>${formatTestingDuration(saved)}</strong></div>
      </div>
      <p class="testing-takeaway"><strong>The idea:</strong> trace which tests execute the changed production code, then run the smallest set that preserves that evidence.</p>
      <button class="game-button" type="button" data-game-restart>Start again</button>
    </div>
  `;
  stage.querySelector('[data-game-restart]').addEventListener('click', () => renderTestingRound(stage, 0, newTestingProgress()));
  focusGameHeading(stage);
};

const renderTestingRound = (stage, roundIndex, progress) => {
  clearTestingStory(stage);
  const round = testingRounds[roundIndex];

  stage.innerHTML = `
    <form class="game-round testing-round" data-test-form>
      ${renderProgress(roundIndex, testingRounds.length, progress.score, testingRounds.length * 3)}
      <p class="game-scenario-label">${round.label}</p>
      <h4 class="testing-round-title" tabindex="-1" data-game-focus>${round.title}</h4>
      <div class="testing-steps" aria-label="How to play">
        <div class="testing-step is-active" data-testing-step="change"><span>1</span><p><strong>Make the change</strong>Click the production method named in the ticket.</p></div>
        <div class="testing-step" data-testing-step="tests"><span>2</span><p><strong>Trace the impact</strong>Select every test whose path can reach the change.</p></div>
        <div class="testing-step" data-testing-step="run"><span>3</span><p><strong>Run the tests</strong>Check safety and time saved.</p></div>
      </div>
      <div class="change-brief testing-ticket"><span>Change request</span><p>${round.ticket}</p></div>
      ${renderMethodTestGraph(round)}
      <div class="testing-diff is-hidden" data-testing-diff aria-live="polite">
        <div class="testing-diff-heading"><span>Simulated edit</span><strong data-diff-method></strong></div>
        <code class="diff-line is-removed">− ${round.diff.before}</code>
        <code class="diff-line is-added">+ ${round.diff.after}</code>
        <p>${round.diff.explanation}</p>
      </div>
      <div class="testing-selection-summary" aria-live="polite">
        <div><span>Full suite</span><strong>${round.fullSuiteTests} tests · ${formatTestingDuration(round.fullSuiteDuration)}</strong></div>
        <div><span>Your selection</span><strong data-selected-time>Choose a method first</strong></div>
        <div><span>Projected saving</span><strong data-saved-time>—</strong></div>
      </div>
      <p class="testing-status" data-testing-status role="status">Start with step 1: click the production method requested in the ticket.</p>
      <button class="game-button" type="submit" data-test-submit disabled>Run selected tests</button>
      <div aria-live="polite" data-game-feedback></div>
    </form>
  `;

  const form = stage.querySelector('[data-test-form]');
  const methodButtons = [...stage.querySelectorAll('[data-production-method]')];
  const testButtons = [...stage.querySelectorAll('[data-test-method]')];
  const hookButtons = [...stage.querySelectorAll('[data-test-hook]')];
  const selectableTests = getSelectableTests(round);
  const submitButton = stage.querySelector('[data-test-submit]');
  const status = stage.querySelector('[data-testing-status]');
  const selectedTime = stage.querySelector('[data-selected-time]');
  const savedTime = stage.querySelector('[data-saved-time]');
  const diff = stage.querySelector('[data-testing-diff]');
  const feedback = stage.querySelector('[data-game-feedback]');
  const selectedTests = new Set();
  let changeApplied = false;
  let complete = false;

  const setStep = (step) => {
    stage.querySelectorAll('[data-testing-step]').forEach((item) => {
      const itemStep = item.dataset.testingStep;
      item.classList.toggle('is-active', itemStep === step);
      item.classList.toggle('is-complete', (step === 'tests' && itemStep === 'change') || (step === 'run' && itemStep !== 'run'));
    });
  };
  const getSelectedDuration = () => round.tests.reduce((total, test) => (
    total + (selectedTests.has(test.id) ? (test.duration || 0) : 0)
  ), 0);
  const setEdgeClass = (selector, className, enabled = true) => {
    stage.querySelectorAll(selector).forEach((edge) => edge.classList.toggle(className, enabled));
  };
  const updateGraphSelection = () => {
    stage.querySelectorAll('.method-test-edge, .production-call-edge, .test-lifecycle-edge')
      .forEach((edge) => edge.classList.remove('is-selected'));
    hookButtons.forEach((button) => button.classList.remove('is-selected'));

    const activeHooks = new Set();
    const activeCallPairs = new Set();
    selectedTests.forEach((testId) => {
      const test = selectableTests.find((item) => item.id === testId);
      if (!test) return;
      setEdgeClass(`[data-edge-test="${test.id}"]`, 'is-selected');
      (test.hooks || []).forEach((hookId) => {
        activeHooks.add(hookId);
        setEdgeClass(`[data-edge-test="${hookId}"]`, 'is-selected');
      });
      getReachableCallPairs(round, getTestStartMethods(round, test)).forEach((pair) => activeCallPairs.add(pair));
    });
    activeHooks.forEach((hookId) => stage.querySelector(`[data-test-hook="${hookId}"]`)?.classList.add('is-selected'));
    activeCallPairs.forEach((pair) => {
      const [fromId, toId] = pair.split('|');
      setEdgeClass(`[data-call-from="${fromId}"][data-call-to="${toId}"]`, 'is-selected');
    });
  };
  const updateSelection = () => {
    const duration = getSelectedDuration();
    selectedTime.textContent = `${selectedTests.size} ${selectedTests.size === 1 ? 'test' : 'tests'} · ${formatTestingDuration(duration)}`;
    savedTime.textContent = formatTestingDuration(round.fullSuiteDuration - duration);
    submitButton.disabled = !changeApplied;
    status.textContent = selectedTests.size
      ? `${selectedTests.size} ${selectedTests.size === 1 ? 'test selected' : 'tests selected'}. Run them when your set feels safe.`
      : 'Trace the paths, then run the set you believe is necessary. A zero-test selection is allowed.';
  };

  methodButtons.forEach((button) => button.addEventListener('click', () => {
    if (complete || changeApplied) return;
    const method = round.methods.find((item) => item.id === button.dataset.productionMethod);
    if (method.id !== round.targetMethod) {
      button.classList.add('is-wrong');
      status.textContent = `That is ${method.name}. The change request asks for ${round.methods.find((item) => item.id === round.targetMethod).name}.`;
      window.setTimeout(() => button.classList.remove('is-wrong'), 650);
      return;
    }

    changeApplied = true;
    button.classList.add('is-changed');
    button.setAttribute('aria-pressed', 'true');
    methodButtons.forEach((item) => { item.disabled = true; });
    testButtons.forEach((item) => { item.disabled = false; });
    diff.classList.remove('is-hidden');
    diff.querySelector('[data-diff-method]').textContent = method.name;
    setStep('tests');
    updateSelection();
  }));

  testButtons.forEach((button) => button.addEventListener('click', () => {
    if (complete || !changeApplied) return;
    const testId = button.dataset.testMethod;
    if (selectedTests.has(testId)) selectedTests.delete(testId);
    else selectedTests.add(testId);
    const isSelected = selectedTests.has(testId);
    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
    updateGraphSelection();
    updateSelection();
  }));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (complete) return;
    complete = true;
    const relevantTests = selectableTests.filter((test) => isTestImpacted(round, test));
    const missed = relevantTests.filter((test) => !selectedTests.has(test.id));
    const extra = selectableTests.filter((test) => selectedTests.has(test.id) && !isTestImpacted(round, test));
    const safe = missed.length === 0;
    const roundScore = safe && extra.length === 0 ? 3 : safe && extra.length === 1 ? 2 : safe ? 1 : selectedTests.size ? 1 : 0;
    const duration = getSelectedDuration();
    const saved = round.fullSuiteDuration - duration;
    const nextProgress = {
      score: progress.score + roundScore,
      safeRounds: progress.safeRounds + (safe ? 1 : 0),
      totalDuration: progress.totalDuration + duration,
      totalBaseline: progress.totalBaseline + round.fullSuiteDuration,
    };
    const cosmeticMistake = round.semanticImpact === false && selectedTests.size > 0;
    const resultLead = cosmeticMistake
      ? 'No tests were needed.'
      : safe && extra.length === 0
        ? 'Smallest safe set.'
        : safe
          ? 'Safe, but slower than necessary.'
          : 'Risky selection.';
    const safetyCopy = relevantTests.length === 0
      ? 'No test can observe a behavioural difference in this change.'
      : safe
        ? `All ${relevantTests.length} impacted tests are included.`
      : `${missed.length} impacted ${missed.length === 1 ? 'test is' : 'tests are'} missing: ${missed.map((test) => test.name).join(', ')}.`;
    const speedCopy = extra.length
      ? `${extra.length} unrelated ${extra.length === 1 ? 'test adds' : 'tests add'} time without checking this change.`
      : 'No unrelated tests were added.';

    methodButtons.forEach((button) => { button.disabled = true; });
    testButtons.forEach((button) => {
      button.disabled = true;
      const test = selectableTests.find((item) => item.id === button.dataset.testMethod);
      const relevant = isTestImpacted(round, test);
      button.classList.toggle('is-covered', relevant && selectedTests.has(test.id));
      button.classList.toggle('is-missed', relevant && !selectedTests.has(test.id));
      button.classList.toggle('is-extra', !relevant && selectedTests.has(test.id));
    });
    stage.querySelectorAll('.method-test-edge, .production-call-edge, .test-lifecycle-edge')
      .forEach((edge) => edge.classList.remove('is-selected', 'is-covered', 'is-missed', 'is-extra'));
    hookButtons.forEach((button) => button.classList.remove('is-selected', 'is-covered', 'is-missed', 'is-extra'));

    const pathStates = new Map();
    const setPathState = (selector, stateName) => {
      stage.querySelectorAll(selector).forEach((edge) => {
        const priority = { 'is-extra': 1, 'is-covered': 2, 'is-missed': 3 };
        const current = pathStates.get(edge) || 'is-extra';
        if (!pathStates.has(edge) || priority[stateName] > priority[current]) pathStates.set(edge, stateName);
      });
    };
    selectableTests.forEach((test) => {
      const relevant = isTestImpacted(round, test);
      const selected = selectedTests.has(test.id);
      if (!relevant && !selected) return;
      const stateName = relevant ? (selected ? 'is-covered' : 'is-missed') : 'is-extra';
      setPathState(`[data-edge-test="${test.id}"]`, stateName);
      (test.hooks || []).forEach((hookId) => {
        setPathState(`[data-edge-test="${hookId}"]`, stateName);
        stage.querySelector(`[data-test-hook="${hookId}"]`)?.classList.add(stateName);
      });
      const visiblePaths = relevant
        ? getTestImpactPaths(round, test)
        : getTestStartMethods(round, test).map((methodId) => findMethodPath(round, methodId, round.targetMethod)).filter(Boolean);
      visiblePaths.forEach((path) => {
        path.slice(0, -1).forEach((fromId, index) => {
          const toId = path[index + 1];
          setPathState(`[data-call-from="${fromId}"][data-call-to="${toId}"]`, stateName);
        });
      });
    });
    pathStates.forEach((stateName, edge) => edge.classList.add(stateName));
    setStep('run');
    status.textContent = `${resultLead} ${safetyCopy}`;
    submitButton.remove();
    feedback.innerHTML = `
      <div class="game-feedback testing-feedback">
        <div><strong>${resultLead}</strong><span>${safetyCopy} ${speedCopy} ${round.resultExplanation || ''}</span></div>
        <div class="testing-feedback-metrics">
          <span><small>Safety</small><strong>${safe ? 'Covered' : 'Gap found'}</strong></span>
          <span><small>Selected</small><strong>${formatTestingDuration(duration)}</strong></span>
          <span><small>Time saved</small><strong>${formatTestingDuration(saved)}</strong></span>
        </div>
      </div>
      <button class="game-button game-next" type="button" data-game-next>${roundIndex === testingRounds.length - 1 ? 'See final result' : 'Next change'}</button>
    `;
    const nextButton = feedback.querySelector('[data-game-next]');
    nextButton.addEventListener('click', () => {
      if (roundIndex === testingRounds.length - 1) renderTestingResult(stage, nextProgress);
      else renderTestingRound(stage, roundIndex + 1, nextProgress);
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
      renderTestingStory(stage);
    }
  });
});
