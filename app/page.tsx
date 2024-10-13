'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import UserInputs from '../components/UserInputs';
import { calculatePVGeneration, SolarData, PVInputs } from '../utils/calculatePV';

const Map = dynamic(() => import('../components/Map'), { ssr: false });

const Home: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [solarData, setSolarData] = useState<SolarData | null>(null);
  const [inputs, setInputs] = useState<PVInputs | null>(null);
  const [generationData, setGenerationData] = useState<{
    daily: number;
    hourly: number;
    monthly: number;
    yearly: number;
    costs?: {
      totalSystemCost: number;
      totalInstallationCost: number;
      totalMaintenanceCost: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSolarData = useCallback(async (lat: number, lon: number) => {
    try {
      const response = await axios.get(`/api/solar-data?lat=${lat}&lon=${lon}`);
      console.log('API Response:', response.data);  // Log the entire response
      return response.data.solarData;
    } catch (error) {
      console.error('Error fetching solar data:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data);
      }
      throw error;
    }
  }, []);

  const handleLocationSelect = useCallback(async (latlng: { lat: number; lng: number }) => {
    setLocation(latlng);
    setLoading(true);
    setError(null);
    try {
      const solarData = await fetchSolarData(latlng.lat, latlng.lng);
      setSolarData(solarData);
    } catch (error) {
      console.error('Failed to fetch solar data:', error);
      setError('Failed to fetch solar data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchSolarData]);

  const handleUserInputs = useCallback((userInputs: PVInputs) => {
    setInputs(userInputs);
    if (solarData && userInputs) {
      const energy = calculatePVGeneration(solarData, userInputs);
      setGenerationData(energy);
    }
  }, [solarData]);

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Solar PV Generation Estimation</h1>
      
      <Map onLocationSelect={handleLocationSelect} />

      {loading && <p className="mt-4">Fetching data...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {location && (
        <div className="mt-4">
          <p>Selected Location: Latitude {location.lat}, Longitude {location.lng}</p>
        </div>
      )}

      {solarData && (
        <UserInputs onSubmit={handleUserInputs} />
      )}

      {generationData && solarData && (
        <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
          {/* Estimated PV Generation */}
          <div className="p-4 text-black bg-white rounded shadow">
            <h2 className="text-2xl font-semibold">Estimated PV Generation</h2>
            <p className="mt-2">Hourly: {generationData.hourly.toFixed(2)} kWh</p>
            <p>Daily: {generationData.daily.toFixed(2)} kWh</p>
            <p>Monthly: {generationData.monthly.toFixed(2)} kWh</p>
            <p>Yearly: {generationData.yearly.toFixed(2)} kWh</p>
          </div>

          {/* Extended Solar Data */}
          <div className="p-4 text-black bg-white rounded shadow">
            <h2 className="text-2xl font-semibold">Solar Data</h2>
            <p className="mt-2">
              <strong>Average GHI:</strong> {(solarData.estimated_actuals.reduce((sum, dataPoint) => sum + dataPoint.ghi, 0) / solarData.estimated_actuals.length).toFixed(2)} W/m²
            </p>
            <p>
              <strong>Average POA Global:</strong> {(solarData.estimated_actuals.reduce((sum, dataPoint) => sum + dataPoint.poa_global, 0) / solarData.estimated_actuals.length).toFixed(2)} W/m²
            </p>
            <p>
              <strong>Data Points:</strong> {solarData.estimated_actuals.length}
            </p>
            {/* Additional Solar Data Points */}
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Additional Data Points</h3>
              <p><strong>Temperature Coefficient:</strong> {solarData.temperature_coefficient || 'N/A'}%</p>
              <p><strong>Degradation Rate:</strong> {solarData.degradation_rate || 'N/A'}% per year</p>
              <p><strong>Shading Analysis:</strong> {inputs?.shading.hasShading ? `${inputs.shading.shadingAmount}% shading` : 'No shading detected'}</p>
            </div>

            {/* Optional Costs */}
            {generationData.costs && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold">Cost Estimates</h3>
                <p><strong>Total System Cost:</strong> ${generationData.costs.totalSystemCost.toLocaleString()}</p>
                <p><strong>Total Installation Cost:</strong> ${generationData.costs.totalInstallationCost.toLocaleString()}</p>
                <p><strong>Total Maintenance Cost (25 years):</strong> ${generationData.costs.totalMaintenanceCost.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
