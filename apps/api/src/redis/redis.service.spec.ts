import { normalizeRedisUrl } from './redis.service';

describe('normalizeRedisUrl', () => {
  it('upgrades Upstash redis URLs to TLS', () => {
    expect(
      normalizeRedisUrl('redis://default:secret@sample.upstash.io:6379'),
    ).toBe('rediss://default:secret@sample.upstash.io:6379');
  });

  it('keeps existing Upstash TLS URLs unchanged', () => {
    expect(
      normalizeRedisUrl('rediss://default:secret@sample.upstash.io:6379'),
    ).toBe('rediss://default:secret@sample.upstash.io:6379');
  });

  it('does not rewrite ordinary Redis URLs', () => {
    expect(normalizeRedisUrl('redis://localhost:6379')).toBe(
      'redis://localhost:6379',
    );
  });

  it('trims whitespace and matching outer quotes', () => {
    expect(
      normalizeRedisUrl('  "redis://default:secret@sample.upstash.io:6379"  '),
    ).toBe('rediss://default:secret@sample.upstash.io:6379');
  });

  it('rejects unsupported URL protocols', () => {
    expect(normalizeRedisUrl('https://sample.upstash.io')).toBeUndefined();
  });

  it('rejects malformed URLs', () => {
    expect(normalizeRedisUrl('not-a-redis-url')).toBeUndefined();
  });

  it('rejects an empty value', () => {
    expect(normalizeRedisUrl('   ')).toBeUndefined();
  });
});
