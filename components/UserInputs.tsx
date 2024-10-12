import { useState, FormEvent } from 'react';

interface UserInputsProps {
  onSubmit: (inputs: {
    siteSize: number;
    installationType: 'rooftop' | 'ground';
    panelEfficiency: number;
    systemLosses: number;
    shading: {
      hasShading: boolean;
      shadingAmount?: number;
    };
    costs?: {
      systemCost?: number;
      installationCost?: number;
      maintenanceCost?: number;
    };
  }) => void;
}

const UserInputs: React.FC<UserInputsProps> = ({ onSubmit }) => {
  const [siteSize, setSiteSize] = useState<number>(0);
  const [installationType, setInstallationType] = useState<'rooftop' | 'ground'>('rooftop');
  const [panelEfficiency, setPanelEfficiency] = useState<number>(15);
  const [systemLosses, setSystemLosses] = useState<number>(10);
  const [hasShading, setHasShading] = useState<boolean>(false);
  const [shadingAmount, setShadingAmount] = useState<number>(0);

  // Optional Cost Fields
  const [systemCost, setSystemCost] = useState<number | undefined>(undefined);
  const [installationCost, setInstallationCost] = useState<number | undefined>(undefined);
  const [maintenanceCost, setMaintenanceCost] = useState<number | undefined>(undefined);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const shading = hasShading
      ? { hasShading: true, shadingAmount }
      : { hasShading: false };

    const costs =
      systemCost || installationCost || maintenanceCost
        ? { systemCost, installationCost, maintenanceCost }
        : undefined;

    onSubmit({
      siteSize,
      installationType,
      panelEfficiency,
      systemLosses,
      shading,
      costs,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
        <label className="flex flex-col">
          Site Area Size (m²):
          <input
            type="number"
            value={siteSize}
            onChange={(e) => setSiteSize(Number(e.target.value))}
            required
            className="p-2 mt-1 text-black bg-white border rounded"
            placeholder="e.g., 50"
          />
        </label>

        <label className="flex flex-col">
          Installation Type:
          <select
            value={installationType}
            onChange={(e) => setInstallationType(e.target.value as 'rooftop' | 'ground')}
            className="p-2 mt-1 text-black bg-white border rounded"
          >
            <option value="rooftop">Rooftop</option>
            <option value="ground">Ground-mounted</option>
          </select>
        </label>

        <label className="flex flex-col">
          Solar Panel Efficiency (%):
          <input
            type="number"
            value={panelEfficiency}
            onChange={(e) => setPanelEfficiency(Number(e.target.value))}
            required
            min="10"
            max="30"
            className="p-2 mt-1 text-black bg-white border rounded"
            placeholder="e.g., 18"
          />
        </label>

        <label className="flex flex-col">
          System Losses (%):
          <input
            type="number"
            value={systemLosses}
            onChange={(e) => setSystemLosses(Number(e.target.value))}
            required
            min="0"
            max="50"
            className="p-2 mt-1 text-black bg-white border rounded"
            placeholder="e.g., 10"
          />
        </label>

        {/* Shading Analysis */}
        <label className="flex flex-col">
          Shading Analysis:
          <div className="flex items-center mt-1">
            <input
              type="checkbox"
              checked={hasShading}
              onChange={(e) => setHasShading(e.target.checked)}
              className="mr-2"
            />
            <span>Yes</span>
          </div>
        </label>

        {hasShading && (
          <label className="flex flex-col">
            Shading Amount (%):
            <input
              type="number"
              value={shadingAmount}
              onChange={(e) => setShadingAmount(Number(e.target.value))}
              required
              min="0"
              max="100"
              className="p-2 mt-1 text-black bg-white border rounded"
              placeholder="e.g., 20"
            />
          </label>
        )}

        {/* Optional Cost Inputs */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Optional: Cost Inputs</h2>

          <label className="flex flex-col mt-2">
            System Cost ($):
            <input
              type="number"
              value={systemCost}
              onChange={(e) => setSystemCost(e.target.value ? Number(e.target.value) : undefined)}
              className="p-2 mt-1 text-black bg-white border rounded"
              placeholder="e.g., 15000"
            />
          </label>

          <label className="flex flex-col mt-2">
            Installation Cost ($):
            <input
              type="number"
              value={installationCost}
              onChange={(e) => setInstallationCost(e.target.value ? Number(e.target.value) : undefined)}
              className="p-2 mt-1 text-black bg-white border rounded"
              placeholder="e.g., 3000"
            />
          </label>

          <label className="flex flex-col mt-2">
            Maintenance Cost ($/year):
            <input
              type="number"
              value={maintenanceCost}
              onChange={(e) => setMaintenanceCost(e.target.value ? Number(e.target.value) : undefined)}
              className="p-2 mt-1 text-black bg-white border rounded"
              placeholder="e.g., 500"
            />
          </label>
        </div>

        <button type="submit" className="px-4 py-2 rounded bg-foreground text-background hover:bg-textSecondary">
          Calculate
        </button>
      </form>
    </div>
  );
};

export default UserInputs;