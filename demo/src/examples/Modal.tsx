import Floater from 'react-floater';
import { Button, Input } from '@heroui/react';
import { X } from 'lucide-react';

import Column from '../components/Column';

function Content({ closeFn }: any) {
  return (
    <div className="relative w-[90vh] h-[90vh] z-50 bg-white p-8 rounded-2xl">
      <h3 className="text-xl font-bold text-center mb-1">
        I'm a custom component acting as modal.
      </h3>
      <p className="text-center mb-8">No arrow and centered</p>
      <Button className="absolute top-2 right-2" isIconOnly onPress={closeFn} variant="light">
        <X size={24} />
      </Button>
      <form
        className="max-w-2xl mx-auto space-y-8"
        onSubmit={event => {
          event.preventDefault();
          closeFn();
        }}
      >
        <Input label="Name" labelPlacement="outside-top" name="name" variant="bordered" />
        <Input label="E-mail" labelPlacement="outside-top" name="email" variant="bordered" />

        <Button color="primary" type="submit">
          SEND
        </Button>
      </form>
    </div>
  );
}

export default function Modal({ cb }: any) {
  return (
    <Column>
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
        <Button color="primary" size="sm">
          Modal
        </Button>
      </Floater>
    </Column>
  );
}
