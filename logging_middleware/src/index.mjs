const VALID_STACKS = new Set(['backend', 'frontend']);
const VALID_LEVELS = new Set(['debug', 'info', 'warn', 'error', 'fatal']);
const VALID_PACKAGES = new Set([
  'cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service',
  'api', 'component', 'hook', 'page', 'state', 'style',
  'auth', 'config', 'middleware', 'utils',
]);

let tokenGetterRef = null;

export function initLogger(tokenGetter) {
  if (typeof tokenGetter !== 'function') {
    throw new Error('[campus/logger] initLogger requires an async function');
  }
  tokenGetterRef = tokenGetter;
}

export async function Log(stack, level, packageName, message) {
  try {
    if (!VALID_STACKS.has(stack) || !VALID_LEVELS.has(level) || !VALID_PACKAGES.has(packageName)) return;
    if (!tokenGetterRef) return;

    let token;
    try {
      token = await tokenGetterRef();
    } catch (_) {
      return;
    }

    const logsUrl =
      (typeof process !== 'undefined' && process.env && process.env.LOGS_URL) ||
      'http://4.224.186.213/evaluation-service/logs';

    const payload = {
      stack,
      level,
      package: packageName,
      message: String(message),
      timestamp: new Date().toISOString(),
    };

    fetch(logsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch (_) {
    // never throw from logger
  }
}

export default { initLogger, Log };
