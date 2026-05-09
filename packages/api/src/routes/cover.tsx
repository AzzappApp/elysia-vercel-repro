import { ImageResponse } from '@vercel/og';
import { Elysia, t } from 'elysia';

export const cover = new Elysia().get(
  '/cover',
  ({ query }) => {
    const title = query.title ?? 'Repro';
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            color: 'white',
            fontSize: 64,
          }}
        >
          {title}
        </div>
      ),
      { width: 1200, height: 630 },
    );
  },
  {
    query: t.Object({
      title: t.Optional(t.String()),
    }),
  },
);
