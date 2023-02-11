import * as React from 'react';

import { withApollo } from '../../api-client/withApollo';
import { TablePaginationUnstyled } from '@mui/base';
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

const OptionLabel = styled('label')({
  display: 'flex',
  flexDirection: 'column',
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

  const appliedFilters = React.useMemo<AvailableFilters>(
    () => ({
      ...removeEmpty(router.query),
      // Defaults
      page: router.query?.page ? parseInt(router.query?.page, 10) : 0,
      rowsPerPage: router.query?.rowsPerPage
        ? parseInt(router.query?.rowsPerPage, 10)
        : 5,
    }),
    [router.query]
  );

  const setAppliedFilters = React.useCallback(
    (newFilters: AvailableFilters) => {
      router.push(
        {
          pathname: router.pathname,
          query: {
            ...removeEmpty(router.query),
            ...removeEmpty(newFilters),
            fromDate: newFilters.fromDate
              ? new Date(newFilters.fromDate).toISOString()
              : undefined,
            toDate: newFilters.toDate
              ? new Date(newFilters.toDate).toISOString()
              : undefined,
          },
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  const { data: areaData } = useAreasQuery();
  const { data, refetch } = useSearchLoosQuery({
    variables: {
      filters: {
        active: true,
        fromDate: appliedFilters.fromDate ?? undefined,
        toDate: appliedFilters.toDate ?? undefined,
        text: appliedFilters.text ?? undefined,
        areaName: appliedFilters.areaName ?? undefined,
      },
      pagination: {
        page: appliedFilters.page + 1,
        limit: appliedFilters.rowsPerPage,
      },
      sort: appliedFilters.sort,
    },
  });

  React.useEffect(() => {
    refetch({
      filters: {
        active: true,
        fromDate: appliedFilters.fromDate ?? undefined,
        toDate: appliedFilters.toDate ?? undefined,
        text: appliedFilters.text ?? undefined,
        areaName: appliedFilters.areaName ?? undefined,
      },
      pagination: {
        page: appliedFilters.page + 1,
        limit: appliedFilters.rowsPerPage,
      },
      sort: appliedFilters.sort,
    });
  }, [refetch, appliedFilters]);

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

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    appliedFilters.page > 0
      ? Math.max(
          0,
          (1 + appliedFilters.page) * appliedFilters.rowsPerPage - rows.length
        )
      : 0;

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
      page: 0,
      rowsPerPage: parseInt(event.target.value, 10),
    });
  };

  return (
    <div>
      <Box display={'flex'} flexWrap={'wrap'} css={{ gap: '1rem' }}>
        <OptionLabel>
          Search Text
          <input
            value={appliedFilters.text}
            onChange={(e) =>
              setAppliedFilters({ ...appliedFilters, text: e.target.value })
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
        <Button variant="primary">Search</Button>
      </Box>

      <Spacer mt={4} />
      <table aria-label="custom pagination table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Area</th>
            <th>Contributors</th>
            <th>Date Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row?.id}>
              <td>{row?.name}</td>
              <td>{row?.area}</td>
              <td>{row?.contributors}</td>
              <td>{row?.updatedAt}</td>
            </tr>
          ))}

          {emptyRows > 0 && (
            <tr style={{ height: 34 * emptyRows }}>
              <td colSpan={4} />
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <TablePaginationUnstyled
              rowsPerPageOptions={[
                5, 10, 25,
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
