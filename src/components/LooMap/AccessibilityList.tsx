import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme, css } from '@emotion/react';

import Box from '../Box';
import Text from '../Text';
import Spacer from '../Spacer';
import { CompressedLooObject } from '../../lib/loo';
import { useLooNamesByIdsQuery } from '../../api-client/graphql';

const Key = ({ children, ...props }) => (
  <Box
    as="span"
    display="inline-flex"
    alignItems="center"
    justifyContent="center"
    flexShrink={0}
    height="1.5rem"
    width="1.5rem"
    borderRadius="5px"
    bg="lightGrey"
    border="2px solid currentColor"
    {...props}
  >
    <b>{children}</b>
  </Box>
);

const Content = ({ toilets }) => {
  const theme = useTheme();

  return (
    <Box
      position="absolute"
      top={['auto', 3]}
      right={['auto', 3]}
      bottom={[3, 'auto']}
      left={[3, 'auto']}
      zIndex={999}
      maxWidth={350}
      p={3}
      bg="white"
    >
      <Text fontSize={16}>
        Use number keys to show a toilet&apos;s details.
      </Text>

      <Spacer mt={3} />

      <Text fontSize={18}>
        <ul>
          {toilets.map((toilet, index) => (
            <Box
              as="li"
              key={index}
              display="flex"
              css={css`
                & + & {
                  margin-top: ${theme.space[1]}px;
                }
              `}
            >
              <Key>{index}</Key>

              <Spacer ml={2} />

              {toilet || 'Unnamed Toilet'}
            </Box>
          ))}
        </ul>
      </Text>

      <Spacer mt={3} />

      <Text fontSize={16}>Arrow keys pan the map.</Text>

      <Spacer mt={3} />

      <Text fontSize={16}>
        <Key aria-label="minus">-</Key> and <Key aria-label="plus">+</Key> keys
        change the map zoom level.
      </Text>
    </Box>
  );
};

const AccessibilityList = ({
  toilets,
  ...props
}: {
  toilets: CompressedLooObject[];
}) => {
  const [showContent, setShowContent] = React.useState(false);

  // Fetch loo names
  const unorderedNames = useLooNamesByIdsQuery({
    variables: { idList: toilets.map((t) => t?.id) },
  });

  // to ensure it gets announced, there must be a delay between the existence of the aria live element and the content
  useEffect(() => {
    setTimeout(() => {
      setShowContent(true);
    }, 300);
  }, []);

  const nameMap = Object.fromEntries(
    unorderedNames.data?.looNamesByIds.map((e) => [e.id, e.name]) || []
  );

  const names = toilets.map((t) => nameMap[t?.id] || 'Name Unknown');

  return (
    <div
      role="status"
      aria-atomic="true"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {showContent && <Content toilets={names || []} {...props} />}
    </div>
  );
};

// eslint-disable-next-line functional/immutable-data
AccessibilityList.propTypes = {
  toilets: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default AccessibilityList;
