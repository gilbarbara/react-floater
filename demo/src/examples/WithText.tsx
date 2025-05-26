import Floater from 'react-floater';

function FloaterFactory({ cb, content = "I'm called from a large body of text!", text }: any) {
  return (
    <Floater callback={cb} content={content} event="hover" placement="top">
      <span className="underline decoration-primary underline-offset-4">{text}</span>
    </Floater>
  );
}

export default function WithText({ cb }: any) {
  const away = <FloaterFactory cb={cb} text="away" />;

  const semantics = (
    <FloaterFactory
      cb={cb}
      content={
        <p>
          Semantics (from Ancient Greek: σημαντικός sēmantikos, "significant")[1][2] is the
          linguistic and philosophical study of meaning, in language, programming languages, formal
          logics, and semiotics.
        </p>
      }
      text="Semantics"
    />
  );

  return (
    <div className="mx-auto max-w-lg text-base/7">
      Far far {away}, behind the word mountains, far from the countries Vokalia and Consonantia,
      there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the{' '}
      {semantics}, a large language ocean. A small river named Duden flows by their place and
      supplies it with the necessary regelialia. It is a paradisematic country, in which roasted
      parts of sentences fly into your mouth.
    </div>
  );
}
