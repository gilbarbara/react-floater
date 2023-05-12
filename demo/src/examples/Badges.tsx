import styled from '@emotion/styled';

const Wrapper = styled.div`
  align-items: center;
  background-color: #fff;
  display: flex;
  justify-content: center;
  padding: 15px;
`;

const Repo = styled.a`
  align-items: center;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #fff;
  color: #333;
  display: flex;
  font-size: 14px;
  padding: 6px 12px;
  margin-right: 30px;
  text-decoration: none;
`;

const GitHub = styled.img`
  height: 25px;
  margin-right: 8px;
  width: 25px;
`;

const CodeSandbox = styled.img`
  height: 38px;
`;

function Badges() {
  return (
    <Wrapper>
      <Repo href="https://github.com/gilbarbara/react-floater" target="_blank">
        <GitHub alt="View on GitHub" src="https://cdn.svgporn.com/logos/github-icon.svg" />
        <span>
          Get it on <b>GitHub</b>
        </span>
      </Repo>

      <a href="https://codesandbox.io/s/84vn36m178">
        <CodeSandbox
          alt="Edit react-floater"
          src="https://codesandbox.io/static/img/play-codesandbox.svg"
        />
      </a>
    </Wrapper>
  );
}

export default Badges;
