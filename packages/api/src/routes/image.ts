import { Elysia, t } from 'elysia';
import sharp from 'sharp';

export const image = new Elysia().get(
  '/image/placeholder',
  async ({ query, set }) => {
    const width = Number(query.w ?? 200);
    const height = Number(query.h ?? 200);
    const buffer = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 30, g: 41, b: 59 },
      },
    })
      .png()
      .toBuffer();
    set.headers['content-type'] = 'image/png';
    return buffer;
  },
  {
    query: t.Object({
      w: t.Optional(t.String()),
      h: t.Optional(t.String()),
    }),
  },
);
