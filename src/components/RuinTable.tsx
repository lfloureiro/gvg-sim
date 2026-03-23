import type {
  RuinDefinition,
  RuinState,
  RuinStateField,
  Tribe,
} from "../types";

type RuinTableProps = {
  title: string;
  ruins: RuinDefinition[];
  ruinStateMap: Record<string, RuinState>;
  tribes: Tribe[];
  onChange: (
    ruinId: string,
    field: RuinStateField,
    value: string | null
  ) => void;
};

function TribeSelect({
  value,
  tribes,
  onChange,
}: {
  value: string | null;
  tribes: Tribe[];
  onChange: (value: string | null) => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value || null)}
    >
      <option value="">— no tribe —</option>
      {tribes.map((tribe) => (
        <option key={tribe.id} value={tribe.id}>
          {tribe.name}
        </option>
      ))}
    </select>
  );
}

export default function RuinTable({
  title,
  ruins,
  ruinStateMap,
  tribes,
  onChange,
}: RuinTableProps) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ruin</th>
              <th>First capture</th>
              <th>Current owner</th>
              <th>Simulate if changed now</th>
            </tr>
          </thead>
          <tbody>
            {ruins.map((ruin) => {
              const state = ruinStateMap[ruin.id];

              return (
                <tr key={ruin.id}>
                  <td className="ruin-cell">{ruin.name}</td>
                  <td>
                    <TribeSelect
                      value={state?.firstCaptureBy ?? null}
                      tribes={tribes}
                      onChange={(value) =>
                        onChange(ruin.id, "firstCaptureBy", value)
                      }
                    />
                  </td>
                  <td>
                    <TribeSelect
                      value={state?.currentOwner ?? null}
                      tribes={tribes}
                      onChange={(value) =>
                        onChange(ruin.id, "currentOwner", value)
                      }
                    />
                  </td>
                  <td>
                    <TribeSelect
                      value={state?.simulatedOwner ?? null}
                      tribes={tribes}
                      onChange={(value) =>
                        onChange(ruin.id, "simulatedOwner", value)
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}