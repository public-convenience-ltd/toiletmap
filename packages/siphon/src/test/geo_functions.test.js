const _ = require('lodash');

const geo = require('../geo');

const BOUND_SORT = ['min.lat', 'min.lng', 'max.lat', 'max.lng'];
const data = require('./data/geo_functions');

describe('getCoordBounds', () => {
  it('should be able to be used to see if within two known coordinates are within a known distance of eachother', () => {
    // this one is a bit of fun, just some coords on the street outside neontribe that we know are within 25m of eachother and that we know are not within 25m of eachother
    const neontribeDoor = [1.2948448, 52.633182];
    const neontribeNeighbour = [1.2950308, 52.633206]; // about 12.5m down the road
    const oldMeetingHouseChurch = [1.2953408, 52.633278]; // about 35m down the road

    const bounds = geo.getCoordBounds(...neontribeDoor, 25);

    const neighbourIn =
      neontribeNeighbour[0] >= bounds.min.lng &&
      neontribeNeighbour[0] <= bounds.max.lng &&
      neontribeNeighbour[1] >= bounds.min.lat &&
      neontribeNeighbour[1] <= bounds.max.lat;
    expect(neighbourIn).toBeTruthy();

    const oldMeetingHouseChurchIn =
      oldMeetingHouseChurch[0] >= bounds.min.lng &&
      oldMeetingHouseChurch[0] <= bounds.max.lng &&
      oldMeetingHouseChurch[1] >= bounds.min.lat &&
      oldMeetingHouseChurch[1] <= bounds.max.lat;
    expect(oldMeetingHouseChurchIn).toBeFalsy();
  });

  it('should give the correct latitude displacement', () => {
    // calculated as the proportion this should be up or down the Earth's
    // surface as a latitude angle
    const bounds = geo.getCoordBounds(0, 51, 25);
    expect(bounds.min.lat).toBeCloseTo(50.99977516959852, 7); // 7 sig fig should be <1cm in Britain (from a brief hopefully-correct check)
    expect(bounds.max.lat).toBeCloseTo(51.00022483040148, 7);
  });

  it('should have a longitude that is guaranteed to contain its largest possible displacement by the radius', () => {
    const bounds = geo.getCoordBounds(0, 51, 25);
    expect(bounds.min.lng).toBeCloseTo(-0.0003572607755312657, 7);
    expect(bounds.max.lng).toBeCloseTo(0.0003572607755312657, 7);
  });

  it('should have a longitude that covers the entire Earth if the bounds go over the poles', () => {
    const bounds = geo.getCoordBounds(0, 89, 200000);
    expect(bounds.min.lng).toBe(-180);
    expect(bounds.max.lng).toBe(180);
  });

  it('should wrap-around coordinates if necessary', () => {
    let bounds = geo.getCoordBounds(0, 90, 25);
    expect(bounds.min.lat).toBeCloseTo(89.99977516959852, 7);
    expect(bounds.max.lat).toBeCloseTo(-89.99977516959852, 7);

    bounds = geo.getCoordBounds(180, 51, 25);
    expect(bounds.min.lng).toBeCloseTo(179.99964273922447, 7);
    expect(bounds.max.lng).toBeCloseTo(-179.99964273922447, 7);
  });

  it('should produce a correct bounding box even if the radius is 0, to show ambiguity', () => {
    const somewhereBounds = geo.getCoordBounds(1, 51, 0);
    expect(somewhereBounds.min.lng).toBe(1);
    expect(somewhereBounds.max.lng).toBe(1);
    expect(somewhereBounds.min.lat).toBe(51);
    expect(somewhereBounds.max.lat).toBe(51);

    // at boundary of the latitude, this should include both the negatively and
    // positively signed variant of the angle
    const latBounds = geo.getCoordBounds(10, 90, 0);
    expect(latBounds.min.lng).toBe(-180);
    expect(latBounds.max.lng).toBe(180);
    expect(latBounds.min.lat).toBe(90); // note that min should be more than max to show wrap-around
    expect(latBounds.max.lat).toBe(-90);

    // at boundary of the longitude, this should include both the negatively and
    // positively signed variant of the angle
    const longBounds = geo.getCoordBounds(180, 51, 0);
    expect(longBounds.min.lng).toBe(180);
    expect(longBounds.max.lng).toBe(-180);
    expect(longBounds.min.lat).toBe(51);
    expect(longBounds.max.lat).toBe(51);

    // at boundary of both, the latitude should represnent both signs and every
    // longitude should be represented
    const bothBounds = geo.getCoordBounds(180, 90, 0);
    expect(bothBounds.min.lng).toBe(-180);
    expect(bothBounds.max.lng).toBe(180);
    expect(bothBounds.min.lat).toBe(90);
    expect(bothBounds.max.lat).toBe(-90);
  });

  it('should have coordinates that span the entire Earth if the radius is large enough', () => {
    expect(geo.getCoordBounds(0, 51, 10070000)).toEqual({
      min: {
        lat: -90,
        lng: -180,
      },
      max: {
        lat: 90,
        lng: 180,
      },
    });
  });
});

describe('removeBoundWrapAround', () => {
  it('should not alter bounds when unnecessary', () => {
    for (let toNotAlter of data.removeBoundWrapAround.toNotAlter) {
      expect(geo.removeBoundWrapAround(toNotAlter)).toEqual([toNotAlter]);
    }
  });

  it('should handle latitude wrap-around', () => {
    const io = data.removeBoundWrapAround.toWrapAround.lat;
    const expected = _.sortBy(io.after, BOUND_SORT);
    const actual = _.sortBy(geo.removeBoundWrapAround(io.before), BOUND_SORT);
    expect(actual).toEqual(expected);
  });

  it('should handle longitude wrap-around', () => {
    const io = data.removeBoundWrapAround.toWrapAround.lng;
    const expected = _.sortBy(io.after, BOUND_SORT);
    const actual = _.sortBy(geo.removeBoundWrapAround(io.before), BOUND_SORT);
    expect(actual).toEqual(expected);
  });

  it('should handle both latitude and longitude wrap-around', () => {
    const io = data.removeBoundWrapAround.toWrapAround.both;
    const expected = _.sortBy(io.after, BOUND_SORT);
    const actual = _.sortBy(geo.removeBoundWrapAround(io.before), BOUND_SORT);
    expect(actual).toEqual(expected);
  });
});
