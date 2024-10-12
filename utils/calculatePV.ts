export interface PVInputs {
    siteSize: number; // in m²
    installationType: 'rooftop' | 'ground';
    panelEfficiency: number; // in %
    systemLosses: number; // in %
    shading: {
      hasShading: boolean;
      shadingAmount?: number; // in %
      shadingArea?: number; // in m²
      shadingPattern?: 'uniform' | 'partial' | 'time-dependent';
    };
    costs?: {
      systemCost?: number;
      installationCost?: number;
      maintenanceCost?: number;
    };
  }
  
  export interface SolarData {
    estimated_actuals: Array<{
      poa_global: number; // Plane of Array Irradiance (W/m²)
      ghi: number; // Global Horizontal Irradiance (W/m²)
      period_end: string; // ISO8601 timestamp
    }>;
    temperature_coefficient?: number; // in %
    degradation_rate?: number; // in % per year
  }
  
  export function calculatePVGeneration(
    solarData: SolarData,
    inputs: PVInputs
  ): {
    daily: number;
    hourly: number;
    monthly: number;
    yearly: number;
    costs?: {
      totalSystemCost: number;
      totalInstallationCost: number;
      totalMaintenanceCost: number;
    };
  } {
    const { siteSize, panelEfficiency, systemLosses, shading, costs } = inputs;
  
    // Calculate average GHI from all data points
    const averageGHI =
      solarData.estimated_actuals.reduce((sum, dataPoint) => sum + dataPoint.ghi, 0) /
      solarData.estimated_actuals.length;
  
    // Adjust GHI based on shading if applicable
    const adjustedGHI = shading.hasShading
      ? averageGHI * (1 - (shading.shadingAmount || 0) / 100)
      : averageGHI;
  
    // Convert W/m² to kWh/m²/day (assuming 24 hours in a day)
    const dailyIrradiance = (adjustedGHI * 24) / 1000;
  
    // Calculate total energy per day (kWh)
    const totalEnergyPerDay = siteSize * dailyIrradiance * (panelEfficiency / 100);
  
    // Apply system losses
    const energyAfterLosses = totalEnergyPerDay * (1 - systemLosses / 100);
  
    const generation = {
      daily: energyAfterLosses,
      hourly: energyAfterLosses / 24,
      monthly: energyAfterLosses * 30.44, // Average days in a month
      yearly: energyAfterLosses * 365,
    };
  
    if (costs) {
      const { systemCost = 0, installationCost = 0, maintenanceCost = 0 } = costs;
      const totalSystemCost = systemCost + installationCost;
      const totalMaintenanceCost = maintenanceCost * 25; // Assuming 25 years
  
      return {
        ...generation,
        costs: {
          totalSystemCost,
          totalInstallationCost: installationCost,
          totalMaintenanceCost,
        },
      };
    }
  
    return generation;
  }
