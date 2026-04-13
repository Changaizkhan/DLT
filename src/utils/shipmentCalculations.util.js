/**
 * Volumetric weight (cm): L×W×H / 5000 (common air-cargo divisor).
 * Volume: L×W×H in m³ (cm³ → m³ divide by 1e6).
 * Per line: metrics × quantity (pieces).
 */
function lineMetrics({ lengthCm, widthCm, heightCm, weightKg, quantity }) {
  const q = quantity;
  const volM3PerPiece = (lengthCm * widthCm * heightCm) / 1_000_000;
  const volumetricKgPerPiece = (lengthCm * widthCm * heightCm) / 5000;
  return {
    lineVolumeCubicM: volM3PerPiece * q,
    lineVolumetricWeightKg: volumetricKgPerPiece * q,
    lineActualWeightKg: weightKg * q,
  };
}

function aggregatePackages(packages) {
  return packages.reduce(
    (acc, p) => {
      const m = lineMetrics(p);
      return {
        totalVolumeCubicM: acc.totalVolumeCubicM + m.lineVolumeCubicM,
        totalVolumetricWeightKg: acc.totalVolumetricWeightKg + m.lineVolumetricWeightKg,
        totalActualWeightKg: acc.totalActualWeightKg + m.lineActualWeightKg,
      };
    },
    { totalVolumeCubicM: 0, totalVolumetricWeightKg: 0, totalActualWeightKg: 0 }
  );
}

module.exports = { lineMetrics, aggregatePackages };
