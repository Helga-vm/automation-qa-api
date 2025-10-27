export const invalidCarStructure = [
    {
        carBrandId: 1,
        carModelId: 1
    },
    {
        carBrandId: 1,
        mileage: 1
    },
    {
        carModelId: 1,
        mileage: 1
    },
    {
        carBrandId: 1,
        carModelId: 1,
        mileage: 1,
        newField: "somedata"
    },
];

export const invalidCarData =[
    {
        carBrandId: "one",
        carModelId: 1,
        mileage: 1
    },
    {
        carBrandId: 1,
        carModelId: "one",
        mileage: 1
    },
    {
        carBrandId: 1,
        carModelId: 1,
        mileage: "one"
    },    
    {
        carBrandId: 1,
        carModelId: 1,
        mileage: 1000000
    },
    {
        carBrandId: 1,
        carModelId: 1,
        mileage: 0
    }
];

export const invalidCarDataLimits =[
    {
        carBrandId: 0,
        carModelId: 1,
        mileage: 1
    },   
    {
        carBrandId: 1,
        carModelId: 0,
        mileage: 1
    },     
    {
        carBrandId: 1,
        carModelId: 23,
        mileage: 1
    }
];