import { addNunjucksFilters, matchRoutes, autoStoreData } from '../../lib/utils';

const coreFilters = require('../../lib/core_filters');
jest.mock('../../lib/core_filters');
const customFilters = require('../../app/filters');
jest.mock('../../app/filters');

// Import session data defaults to use in tests
const sessionDataDefaults = require('../../app/data/session-data-defaults');

test('test addNunjucksFilters filter added', () => {
    coreFilters.mockImplementation(() => {return {1: "core-filter"};});
    customFilters.mockImplementation(() => {return {2: "custom-filter"};});
    const mockEnv = {
        addFilter: jest.fn((filter) => {
            return;
        }),
    };
    
    addNunjucksFilters(mockEnv);

    expect(coreFilters).toHaveBeenCalledTimes(1);
    expect(customFilters).toHaveBeenCalledTimes(1);
    expect(mockEnv.addFilter).toHaveBeenCalledTimes(2);
});

test('test matchRoutes no error', () => {
    const mockRequest = {
        path: "http://www.example.com",
    };

    const mockResponse = {
        set: jest.fn(),
        end: jest.fn(),
        render: jest.fn((routePath, cb) => {
            // Call the callback with a template not found error the first time
            cb();
          }),
    };

    const mockNext = jest.fn();

    matchRoutes(mockRequest, mockResponse, mockNext);

    expect(mockResponse.render).toHaveBeenCalled();
    expect(mockResponse.set).toHaveBeenCalled();
    expect(mockResponse.end).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
});

test('test matchRoutes with other error', () => {
    const mockRequest = {
        path: "http://www.example.com",
    };

    const mockResponse = {
        set: jest.fn(),
        end: jest.fn(),
        render: jest.fn((routePath, cb) => {
            // Call the callback with a template not found error the first time
            cb(new Error('template in folder'));
          }),
    };

    const mockNext = jest.fn();

    matchRoutes(mockRequest, mockResponse, mockNext);

    expect(mockResponse.render).toHaveBeenCalled();
    expect(mockResponse.set).not.toHaveBeenCalled();
    expect(mockResponse.end).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
});

test('test matchRoutes with template error', () => {
    const mockRequest = {
        path: "http://www.example.com",
    };

    const mockResponse = {
        set: jest.fn(),
        end: jest.fn(),
        render: jest.fn((routePath, cb) => {
            // Call the callback with a template not found error the first time
            cb(new Error('template not found'));
          }),
    };

    const mockNext = jest.fn();

    matchRoutes(mockRequest, mockResponse, mockNext);

    expect(mockResponse.render).toHaveBeenCalled();
    expect(mockResponse.set).not.toHaveBeenCalled();
    expect(mockResponse.end).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
});

test('test matchRoutes with empty path', () => {
    const mockRequest = {
        path: "",
    };

    const mockResponse = {
        set: jest.fn(),
        end: jest.fn(),
        render: jest.fn((routePath, cb) => {
            // Call the callback with a template not found error the first time
            cb(new Error('template not found'));
          }),
    };

    const mockNext = jest.fn();

    matchRoutes(mockRequest, mockResponse, mockNext);

    expect(mockResponse.render).toHaveBeenCalled();
    expect(mockResponse.set).not.toHaveBeenCalled();
    expect(mockResponse.end).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
});

test('autoStoreData with request session data not set', () => {
    const mockRequest = {
        session: {},
        body: {1: {2:"two"}},
        query: {"_one": "_one"},
    };

    const mockResponse = {
        set: jest.fn(),
        end: jest.fn(),
        render: jest.fn((routePath, cb) => {
            // Call the callback with a template not found error the first time
            cb(new Error('template not found'));
          }),
        locals:{data:{}},
    };

    const mockNext = jest.fn();

    autoStoreData(mockRequest, mockResponse, mockNext);

    // Check that the specific data is present
    expect(mockResponse.locals.data[1]).toStrictEqual({2:"two"});
    // Check that default session data is also present
    expect(mockResponse.locals.data).toMatchObject(sessionDataDefaults);
});

test('autoStoreData with unchecked in the request', () => {
    const mockRequest = {
        session: {},
        body: {1: "_unchecked"},
        query: {2: ["one", "_unchecked", "three"]},
    };

    const mockResponse = {
        set: jest.fn(),
        end: jest.fn(),
        render: jest.fn((routePath, cb) => {
            // Call the callback with a template not found error the first time
            cb(new Error('template not found'));
          }),
        locals:{data:{}},
    };

    const mockNext = jest.fn();

    autoStoreData(mockRequest, mockResponse, mockNext);

    // Check that the specific data is present (unchecked values should be removed)
    expect(mockResponse.locals.data[2]).toStrictEqual(["one", "three"]);
    // Check that the unchecked value was removed
    expect(mockResponse.locals.data[1]).toBeUndefined();
    // Check that default session data is also present
    expect(mockResponse.locals.data).toMatchObject(sessionDataDefaults);
});
