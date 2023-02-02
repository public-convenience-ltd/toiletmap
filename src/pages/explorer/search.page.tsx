import * as React from 'react';

import { withApollo } from '../../api-client/withApollo';
import { TablePaginationUnstyled } from '@mui/base';
import { useSearchLoosQuery } from '../../api-client/graphql';

const UnstyledTable = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
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

  const { data, refetch } = useSearchLoosQuery({
    variables: {
      filters: { active: true },
      pagination: { page: page + 1, limit: rowsPerPage },
    },
  });

  React.useEffect(() => {
    refetch({
      filters: { active: true },
      pagination: { page: page + 1, limit: rowsPerPage },
    });
  }, [page, refetch, rowsPerPage]);

  React.useEffect(() => {
    if (data) {
      const mapped = data.loos.loos.map((loo) => {
        if (loo?.area[0] == null) {
          console.log(loo);
        }
        return {
          id: loo?.id,
          name: loo?.name ?? 'Unnamed',
          area: loo?.area[0]?.name,
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
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
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

          {/* {emptyRows > 0 && (
            <tr style={{ height: 34 * emptyRows }}>
              <td colSpan={4} />
            </tr>
          )} */}
        </tbody>
        <tfoot>
          <tr>
            <TablePaginationUnstyled
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              colSpan={4}
              count={availableRows}
              rowsPerPage={rowsPerPage}
              page={page}
              slotProps={{
                select: {
                  'aria-label': 'rows per page',
                },
                actions: {
                  showFirstButton: true,
                  showLastButton: true,
                } as any,
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
