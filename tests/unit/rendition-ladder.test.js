const {
  RENDITION_PROFILE_HD720,
  RENDITION_PROFILE_FHD1080,
  resolveRendition,
  renditionMatchesLadder
} = require('../../src/streaming/rendition-ladder');

describe('rendition ladder', () => {
  test('HD 720p L1 row matches design doc', () => {
    const row = resolveRendition(RENDITION_PROFILE_HD720, 'L1');
    expect(row).toMatchObject({
      profile: RENDITION_PROFILE_HD720,
      layerId: 'L1',
      width: 1280,
      height: 720,
      videoBitrateKbps: 1800,
      audioBitrateKbps: 64
    });
    expect(renditionMatchesLadder(row)).toBe(true);
  });

  test('Full HD L2 row matches design doc', () => {
    const row = resolveRendition(RENDITION_PROFILE_FHD1080, 'L2');
    expect(row).toMatchObject({
      width: 1920,
      height: 1080,
      videoBitrateKbps: 8000,
      audioBitrateKbps: 128
    });
  });

  test('rejects unknown profile or layer', () => {
    expect(() => resolveRendition('uhd', 'L0')).toThrow(/Unknown rendition profile/);
    expect(() => resolveRendition(RENDITION_PROFILE_HD720, 'L9')).toThrow(/Unknown layerId/);
  });
});