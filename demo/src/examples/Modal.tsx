import Floater from 'react-floater';
import { Box, Button, ButtonUnstyled, FormGroup, H4, Icon, Input } from '@gilbarbara/components';

function Content({ closeFn }: any) {
  return (
    <Box height="90vh" padding="xl" position="relative" radius="md" variant="white" width="90vw">
      <H4 align="center" mb="xxl">
        I'm a custom component acting as modal. No arrow and centered
      </H4>
      <ButtonUnstyled
        onClick={closeFn}
        padding="sm"
        style={{ position: 'absolute', right: 16, top: 16 }}
      >
        <Icon name="close" size={24} />
      </ButtonUnstyled>
      <Box
        as="form"
        maxWidth={640}
        mx="auto"
        onSubmit={(event) => {
          event.preventDefault();
          closeFn();
        }}
      >
        <FormGroup label="Name">
          <Input name="name" />
        </FormGroup>
        <FormGroup label="E-mail">
          <Input name="email" />
        </FormGroup>

        <Button type="submit">SEND</Button>
      </Box>
    </Box>
  );
}

export default function Modal({ cb }: any) {
  return (
    <Box flex>
      <Floater
        callback={cb}
        component={Content}
        hideArrow
        placement="center"
        styles={{
          options: {
            zIndex: 1000,
          },
        }}
      >
        <Button size="sm">MODAL</Button>
      </Floater>
    </Box>
  );
}
