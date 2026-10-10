import { useState } from 'preact/hooks';
import { useDemo } from '../context';
import { activeConnection } from '../state/access';
import { closeModal, showToast } from '../state/shellActions';
import { Checkbox, Chip, SectionLabel, Toggle } from '../ui/Controls';
import { Modal } from '../ui/Modal';

const redactionRules = ['Authorization headers', 'Cookies', 'Tokens in bodies', 'Secure storage values'];
const ranges = ['Whole session', 'Last 5 minutes', 'Last minute'];

export function ExportModal() {
  const { state, dispatch } = useDemo();
  const session = activeConnection(state)?.session;
  const [include, setInclude] = useState({ network: true, logs: true, keyValue: true });
  const [range, setRange] = useState(ranges[0]);
  const [redact, setRedact] = useState(true);
  const [rules, setRules] = useState(redactionRules);
  if (!session) return null;

  const exportAs = (format: string) => {
    dispatch(closeModal);
    dispatch(showToast, `Session exported as ${format}`);
  };

  return (
    <Modal
      title="Export Session"
      width={520}
      onClose={() => dispatch(closeModal)}
      footer={
        <>
          <span class="xr-spacer" />
          <button type="button" class="xr-button is-outline" disabled={!include.network} onClick={() => exportAs('HAR')}>
            Export HAR
          </button>
          <button type="button" class="xr-button is-primary" onClick={() => exportAs('.xray file')}>
            Save .xray File…
          </button>
        </>
      }
    >
      <div class="xr-form">
        <section>
          <SectionLabel>Include</SectionLabel>
          <div class="xr-checkbox-list">
            <Checkbox checked={include.network} trailing={session.calls.length} onChange={(network) => setInclude({ ...include, network })}>
              Network calls
            </Checkbox>
            <Checkbox checked={include.logs} trailing={session.logs.length} onChange={(logs) => setInclude({ ...include, logs })}>
              Log entries
            </Checkbox>
            <Checkbox checked={include.keyValue} trailing={session.kvChanges.length} onChange={(keyValue) => setInclude({ ...include, keyValue })}>
              Key-value changes
            </Checkbox>
          </div>
        </section>
        <section>
          <SectionLabel>Time range</SectionLabel>
          <div class="xr-chips">
            {ranges.map((r) => (
              <Chip key={r} selected={r === range} onClick={() => setRange(r)}>
                {r}
              </Chip>
            ))}
          </div>
        </section>
        <section>
          <div class="xr-row-between">
            <SectionLabel hint="before the file leaves your computer">Redact sensitive data</SectionLabel>
            <Toggle checked={redact} label="Redact sensitive data" onChange={setRedact} />
          </div>
          {redact && (
            <div class="xr-chips">
              {redactionRules.map((rule) => (
                <Chip key={rule} selected={rules.includes(rule)} onClick={() => setRules(rules.includes(rule) ? rules.filter((r) => r !== rule) : [...rules, rule])}>
                  {rule}
                </Chip>
              ))}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
