import React from 'react';
import '@testing-library/jest-dom/extend-expect';

import { render, fireEvent, waitFor } from '../../test-utils';

import EntryForm from './EntryForm';

test('submits the bare minimum values', async () => {
  const onSubmitSpy = jest.fn();

  const { getByText } = render(
    <EntryForm
      title="Entry Form"
      center={{
        lat: 11.11,
        lng: 22.22,
      }}
      onSubmit={onSubmitSpy}
    >
      <button type="submit">Submit</button>
    </EntryForm>
  );

  fireEvent.click(getByText('Submit'));

  const response = {
    location: {
      lat: 11.11,
      lng: 22.22,
    },
    noPayment: null,
  };

  await waitFor(() => expect(onSubmitSpy).toHaveBeenCalledWith(response));
});

test('transforms multiple choice responses', async () => {
  const onSubmitSpy = jest.fn();

  const { getByText, getByTestId } = render(
    <EntryForm
      title="Entry Form"
      center={{
        lat: 0,
        lng: 0,
      }}
      onSubmit={onSubmitSpy}
    >
      <button type="submit">Submit</button>
    </EntryForm>
  );

  fireEvent.click(getByTestId('women:yes'));
  fireEvent.click(getByTestId('men:no'));
  fireEvent.click(getByTestId('babyChange:no'));
  fireEvent.click(getByTestId('isFree:unknown'));

  fireEvent.click(getByText('Submit'));

  const response = expect.objectContaining({
    women: true,
    men: false,
    babyChange: false,
    noPayment: null,
  });

  await waitFor(() => expect(onSubmitSpy).toHaveBeenCalledWith(response));
});

test('submits correct payment details', async () => {
  const onSubmitSpy = jest.fn();

  const { getByText, getByTestId } = render(
    <EntryForm
      title="Entry Form"
      center={{
        lat: 0,
        lng: 0,
      }}
      onSubmit={onSubmitSpy}
    >
      <button type="submit">Submit</button>
    </EntryForm>
  );

  fireEvent.click(getByTestId('isFree:no'));

  // wait for payment details field to render
  await waitFor(() =>
    expect(getByTestId('paymentDetails')).toBeInTheDocument()
  );

  const field = getByTestId('paymentDetails');

  // focus and blur events necessary to mark react-hook-form fields as dirty
  fireEvent.focus(field);
  fireEvent.change(field, { target: { value: '20p' } });
  fireEvent.blur(field);

  fireEvent.click(getByText('Submit'));

  await waitFor(() => {
    expect(onSubmitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentDetails: '20p',
      })
    );
  });
});

it('clears payment details when switching on free toggle', async () => {
  const onSubmitSpy = jest.fn();

  const { getByText, getByTestId } = render(
    <EntryForm
      title="Entry Form"
      loo={{
        noPayment: false,
        paymentDetails: '20p',
      }}
      center={{
        lat: 0,
        lng: 0,
      }}
      onSubmit={onSubmitSpy}
    >
      <button type="submit">Submit</button>
    </EntryForm>
  );

  fireEvent.click(getByTestId('isFree:yes'));
  fireEvent.click(getByText('Submit'));

  await waitFor(() => {
    expect(onSubmitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        noPayment: true,
        paymentDetails: null,
      })
    );

    expect(onSubmitSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        isFree: expect.anything(),
      })
    );
  });
});

test('calls render prop with dirty fields flag', async () => {
  const childrenSpy = jest.fn();

  const { getByTestId } = render(
    <EntryForm
      title="Entry Form"
      center={{
        lat: 0,
        lng: 0,
      }}
      onSubmit={Function.prototype}
      children={childrenSpy}
    />
  );

  await waitFor(() => {
    expect(childrenSpy).toHaveBeenCalledWith({ hasDirtyFields: false });
  });

  fireEvent.click(getByTestId('isFree:no'));

  await waitFor(() => {
    expect(childrenSpy).toHaveBeenCalledWith({ hasDirtyFields: true });
  });

  fireEvent.click(getByTestId('isFree:unknown'));

  // ensure we're no longer in a dirty state now that we've returned the
  // form to its initial state
  await waitFor(() => {
    expect(childrenSpy).toHaveBeenCalledWith({ hasDirtyFields: false });
  });
});

it('submits correct opening times', async () => {
  const onSubmitSpy = jest.fn();

  const { getByText, getByTestId } = render(
    <EntryForm
      title="Entry Form"
      center={{
        lat: 0,
        lng: 0,
      }}
      onSubmit={onSubmitSpy}
    >
      <button type="submit">Submit</button>
    </EntryForm>
  );

  fireEvent.click(getByTestId('opening-hours-toggle'));

  const toggle = getByTestId('wednesday-toggle');
  await waitFor(() => expect(toggle).toBeInTheDocument());
  fireEvent.click(toggle);

  const from = getByTestId('wednesday-from');
  fireEvent.focus(from);
  fireEvent.change(from, { target: { value: '09:00' } });
  fireEvent.blur(from);

  const to = getByTestId('wednesday-to');
  fireEvent.focus(to);
  fireEvent.change(to, { target: { value: '17:00' } });
  fireEvent.blur(to);

  fireEvent.click(getByText('Submit'));

  await waitFor(() => {
    expect(onSubmitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        openingTimes: [
          'CLOSED',
          'CLOSED',
          ['09:00', '17:00'],
          'CLOSED',
          'CLOSED',
          'CLOSED',
          'CLOSED',
        ],
      })
    );

    expect(onSubmitSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        'has-opening-times': expect.anything(),
      })
    );
  });
});
