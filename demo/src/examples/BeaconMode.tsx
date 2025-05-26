import Floater from 'react-floater';

export default function BeaconMode({ cb }: any) {
  return (
    <div className="flex flex-col flex-1 items-center gap-4">
      <img
        alt="Microsoft Popup"
        className="old-tooltip"
        height="200"
        src="/windows-popup.png"
        width="320"
      />
      <Floater
        callback={cb}
        content={<p className="text-lg">Yeah, this is how we use to look back in the day!</p>}
        disableFlip
        event="hover"
        placement="top"
        target=".old-tooltip"
        wrapperOptions={{
          offset: -20,
          placement: 'bottom',
          position: true,
        }}
      >
        <button aria-label="Beacon" className="relative size-8" type="button">
          <span className="absolute inset-0 animate-ping rounded-full bg-[rgba(48,48,232,0.6)]" />
          <span className="absolute inset-0 rounded-full bg-[rgba(48,48,232,0.6)]" />
        </button>
      </Floater>
      <p className="mt-4">Beacon mode</p>
    </div>
  );
}
