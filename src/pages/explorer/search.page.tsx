import * as React from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { TablePagination } from '@mui/base';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LooFilter,
  SortOrder,
  useAreasQuery,
  useSearchLoosQuery,
} from '../../api-client/graphql';
import { withApollo } from '../../api-client/withApollo';
import Box from '../../components/Box';
import Spacer from '../../components/Spacer';
import Button from '../../design-system/components/Button';
import theme from '../../theme';

const OptionLabel = styled('label')(
  ({ theme }) => ` 
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* Space between label and input */
  font-size: ${theme.fontSizes[2]}px; /* Default font size (12px) */

  @media (max-width: ${theme.breakpoints[1]}) {
    font-size: ${theme.fontSizes[1]}px; /* Smaller font size (10px) */
  }

  @media (min-width: ${theme.breakpoints[2]}) {
    font-size: ${theme.fontSizes[3]}px; /* Larger font size at breakpoint */
  }

  input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
  }

  select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
  }
`,
);

const TableHeader = styled('th')({
  fontWeight: 800,
});

const UnstyledTable = () => {
  const [rows, setRows] = React.useState<
    {
      id: string;
      name: string;
      area: string;
      areaType: string;
      contributors: string;
      updatedAt: string;
    }[]
  >([]);
  const [availableRows, setAvailableRows] = React.useState(0);

  const router = useRouter();

  type AvailableFilters = Partial<
    LooFilter & { sort: SortOrder; page: number; rowsPerPage: number }
  >;

  function removeEmpty(obj: object) {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== ''));
  }

  const initialFilters = React.useMemo<AvailableFilters>(() => {
    return {
      ...removeEmpty(router.query),
      // Defaults
      page: parseInt((router.query?.page as string) ?? '0', 10),
      rowsPerPage: router.query?.rowsPerPage
        ? parseInt(router.query?.rowsPerPage as string, 10)
        : 25,
      text: (router.query?.text as string) ?? '',
    };
  }, [router]);

  const [appliedFilters, setAppliedFilters] =
    React.useState<AvailableFilters>(initialFilters);

  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  React.useEffect(() => {
    setAppliedFilters(initialFilters);
    setIsInitialLoad(false);
  }, [initialFilters]);

  React.useEffect(() => {
    if (!isInitialLoad) {
      applySearch(appliedFilters, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to apply for these filters.
  }, [appliedFilters.sort, appliedFilters.page, appliedFilters.rowsPerPage]);

  const applySearch = React.useCallback(
    (newFilters: AvailableFilters, resetPage = true) => {
      const spreadValues = {
        ...removeEmpty(router.query),
        ...removeEmpty(newFilters),
      };
      router.push(
        {
          pathname: router.pathname,
          query: {
            ...spreadValues,
            page: resetPage ? 0 : spreadValues.page, // Reset back to page 0 on a new search to avoid confusion
            fromDate: newFilters.fromDate
              ? new Date(newFilters.fromDate).toISOString()
              : undefined,
            toDate: newFilters.toDate
              ? new Date(newFilters.toDate).toISOString()
              : undefined,
            text: newFilters.text ?? '',
          },
        },
        undefined,
        { shallow: true },
      );
    },
    [router],
  );

  const { data: areaData } = useAreasQuery();
  const { data } = useSearchLoosQuery({
    variables: {
      filters: {
        active: true,
        fromDate: initialFilters.fromDate ?? undefined,
        toDate: initialFilters.toDate ?? undefined,
        text: initialFilters.text ?? undefined,
        areaName: initialFilters.areaName ?? undefined,
      },
      pagination: {
        page: initialFilters.page + 1,
        limit: initialFilters.rowsPerPage,
      },
      sort: initialFilters.sort,
    },
  });

  React.useEffect(() => {
    if (data) {
      const mapped = data.loos.loos.map((loo) => {
        return {
          id: loo?.id,
          name: loo?.name ?? 'Unnamed',
          area: loo?.area[0]?.name ?? 'No Area',
          areaType: loo?.area[0]?.type,
          contributors: 'Anonymous',
          updatedAt: new Date(loo?.updatedAt).toLocaleDateString(),
        };
      });

      setRows(mapped);
      setAvailableRows(data.loos.total);
    }
  }, [data]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setAppliedFilters({ ...appliedFilters, page: newPage });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setAppliedFilters({
      ...appliedFilters,
      rowsPerPage: parseInt(event.target.value, 10),
    });
  };

  return (
    <div>
      <Box
        as="form"
        display="flex"
        flexDirection={{ base: 'column', md: 'row' }}
        alignItems="flex-start" // Align items to the start for better vertical alignment
        justifyContent="center"
        flexWrap="wrap"
        css={{ gap: '1rem', padding: '1rem' }}
        onSubmit={(e) => {
          e.preventDefault();
          applySearch(appliedFilters);
        }}
      >
        {/* Search Text Input */}
        <OptionLabel>
          Search
          <input
            value={appliedFilters.text}
            placeholder="Search for loos"
            onChange={(e) =>
              setAppliedFilters({
                ...appliedFilters,
                text: e.target.value,
              })
            }
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </OptionLabel>

        {/* Order By Dropdown */}
        <OptionLabel>
          Order By
          <select
            value={appliedFilters.sort}
            onChange={(e) =>
              setAppliedFilters({
                ...appliedFilters,
                sort: e.target.value as SortOrder,
              })
            }
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%', // Ensure full width for consistency
              boxSizing: 'border-box',
            }}
          >
            <option value={SortOrder.NewestFirst}>Newest First</option>
            <option value={SortOrder.OldestFirst}>Oldest First</option>
          </select>
        </OptionLabel>

        {/* Updated After Date Picker */}
        <OptionLabel>
          Updated After
          <input
            type="date"
            value={appliedFilters.fromDate?.split('T')[0] ?? ''}
            onChange={(e) =>
              setAppliedFilters({
                ...appliedFilters,
                fromDate: e.target.value,
              })
            }
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%', // Ensure full width for consistency
              boxSizing: 'border-box',
            }}
          />
        </OptionLabel>

        {/* Updated Before Date Picker */}
        <OptionLabel>
          Updated Before
          <input
            type="date"
            value={appliedFilters.toDate?.split('T')[0] ?? ''}
            onChange={(e) =>
              setAppliedFilters({
                ...appliedFilters,
                toDate: e.target.value,
              })
            }
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%', // Ensure full width for consistency
              boxSizing: 'border-box',
            }}
          />
        </OptionLabel>

        {/* Area Dropdown */}
        <OptionLabel>
          By Area
          <select
            value={appliedFilters.areaName}
            onChange={(e) =>
              setAppliedFilters({
                ...appliedFilters,
                areaName:
                  e.target.value === 'All areas' ? undefined : e.target.value,
              })
            }
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%', // Ensure full width for consistency
              boxSizing: 'border-box',
            }}
          >
            {areaData?.areas &&
              [
                { name: 'All areas', type: 'Local Authority' },
                ...areaData?.areas,
              ].map((area) => (
                <option key={area.name} value={area.name}>
                  {area.name}
                </option>
              ))}
          </select>
        </OptionLabel>
      </Box>

      {/* Centered Search Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Button
          htmlElement="button"
          type="submit"
          variant="secondary"
          style={{
            padding: '0.5rem 2rem',
            backgroundColor: '#8ce9c1',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '5%',
            boxSizing: 'border-box',
            fontSize: '0.875rem',
          }}
        >
          Search
        </Button>
      </div>

      <Spacer mt={4} />

      {/* Table */}
      <table
        aria-label="custom pagination table"
        css={css`
          border-collapse: collapse;
          width: 92.5%;
          margin: 0 auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          /* Responsive font sizes for table cells */
          td,
          th {
            font-size: ${theme
              .fontSizes[1]}px; /* Base font size for small screens */
            ${theme.mediaQueries[0]} {
              font-size: ${theme.fontSizes[2]}px; /* For tablets and up */
            }
            ${theme.mediaQueries[1]} {
              font-size: ${theme.fontSizes[3]}px; /* For desktops */
            }
          }
          tr {
            &:nth-of-type(odd) {
              background-color: ${theme.colors.lightGrey};
            }
            &:nth-of-type(even) {
              background-color: ${theme.colors.white};
            }
          }
          th {
            background-color: ${theme.colors.darkGrey};
            color: ${theme.colors.white};
            padding: 0.5rem;
            text-align: left;
            &:nth-of-type(n + 2) {
              text-align: center; /* Center-align for second column onward */
            }
          }
          td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid ${theme.colors.grey};
            &:nth-of-type(n + 2) {
              text-align: center; /* Center-align for second column onward */
            }
          }
        `}
      >
        <thead>
          <tr>
            <TableHeader>Name</TableHeader>
            <TableHeader>Area</TableHeader>
            <TableHeader>Contributors</TableHeader>
            <TableHeader>Updated on</TableHeader>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row?.id}>
              <td>
                <Link href={`/explorer/loos/${row?.id}`}>{row?.name}</Link>
              </td>
              <td>{row?.area}</td>
              <td>{row?.contributors}</td>
              <td>{row?.updatedAt}</td>
            </tr>
          ))}
        </tbody>

        {/* Pagination footer */}
        <tfoot>
          <tr>
            <TablePagination
              rowsPerPageOptions={[
                5, 10, 25, 50, 100,
                //{ label: 'All', value: availableRows }, // Show all rows
              ]}
              colSpan={4}
              count={availableRows}
              rowsPerPage={appliedFilters.rowsPerPage}
              page={appliedFilters.page}
              slotProps={{
                select: {
                  'aria-label': 'rows per page',
                },
                actions: {
                  showFirstButton: true,
                  showLastButton: true,
                },
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const Search = () => {
  return <UnstyledTable />;
};

export default withApollo(Search);
