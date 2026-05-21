import React from 'react';
import { Text } from 'react-native';

interface MaskedEmailProps {
    email: string,
};

const MaskedEmail = (props: MaskedEmailProps) => {
  const firstTwoChars = props.email.slice(0, 2);
  const lastTwoChars  = props.email.slice(-2);
  const maskedChars   = '*'.repeat(props.email.length - 4); // Two characters are kept unmasked
  const maskedEmail   = `${firstTwoChars}${maskedChars}${lastTwoChars}`;

  return (
    <>
      <Text>{maskedEmail}</Text>
    </>
  );
};

export default MaskedEmail;