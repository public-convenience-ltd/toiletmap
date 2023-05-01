import * as React from 'react';

import { withApollo } from '../../api-client/withApollo';
import { TablePagination } from '@mui/base';
import {
  LooFilter,
  SortOrder,
  useAreasQuery,
  useSearchLoosQuery,
} from '../../api-client/graphql';
import Spacer from '../../components/Spacer';
import Box from '../../components/Box';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import Button from '../../components/Button';
import { css } from '@emotion/react';
import theme from '../../theme';
import Link from 'next/link';

const OptionLabel = styled('label')({
  display: 'flex',
  flexDirection: 'column',
});

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
      page: router.query?.page ? parseInt(router.query?.page, 10) : 0,
      rowsPerPage: router.query?.rowsPerPage
        ? parseInt(router.query?.rowsPerPage, 10)
        : 25,
      text: router.query?.text ?? '',
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
        { shallow: true }
      );
    },
    [router]
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
    newPage: number
  ) => {
    setAppliedFilters({ ...appliedFilters, page: newPage });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
        display={'flex'}
        flexWrap={'wrap'}
        css={{ gap: '1rem' }}
        onSubmit={(e) => {
          e.preventDefault();
          applySearch(appliedFilters);
        }}
      >
        <OptionLabel>
          Search Text
          <input
            value={appliedFilters.text}
            onChange={(e) =>
              setAppliedFilters({
                ...appliedFilters,
                text: e.target.value,
              })
            }
          ></input>
        </OptionLabel>
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
          >
            <option value={SortOrder.NewestFirst}>Newest First</option>
            <option value={SortOrder.OldestFirst}>Oldest First</option>
          </select>
        </OptionLabel>
        <OptionLabel>
          Area
          <select
            value={appliedFilters.areaName}
            onChange={(e) =>
              setAppliedFilters({
                ...appliedFilters,
                areaName:
                  e.target.value === 'All areas' ? undefined : e.target.value,
              })
            }
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
        <OptionLabel>
          Updated After
          <input
            value={appliedFilters.fromDate?.split('T')[0] ?? ''}
            onChange={(e) =>
              setAppliedFilters({
                ...appliedFilters,
                fromDate: e.target.value,
              })
            }
            type="date"
          ></input>
        </OptionLabel>
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
          ></input>
        </OptionLabel>
        <Button type="submit" variant="primary">
          Search
        </Button>
      </Box>

      <Spacer mt={4} />
      <table
        aria-label="custom pagination table"
        css={css`
          border-collapse: collapse;
          width: 100%;
          td,
          th {
            padding: 0.5rem;
          }
          tr:nth-child(odd) td {
            background-color: ${theme.colors.white};
          }
          tr:nth-child(even) td {
            background-color: ${theme.colors.lightGrey};
          }
        `}
      >
        <thead>
          <tr>
            <TableHeader>Name</TableHeader>
            <TableHeader>Area</TableHeader>
            <TableHeader>Contributors</TableHeader>
            <TableHeader>Date Updated</TableHeader>
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
        <tfoot>
          <tr>
            <TablePagination
              rowsPerPageOptions={[
                5, 10, 25, 50,
                // { label: 'All', value: availableRows }, Disabled all for now
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
                } as object,
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
