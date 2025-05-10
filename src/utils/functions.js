import { EXERCISES, SCHEMES, TEMPOS, WORKOUTS } from './shredder';

const exercises = exercisesFlattener(EXERCISES);

export function generateWorkout(args) {
    const { muscles, poison: workout, goal } = args;
    let exer = Object.keys(exercises);
    exer = exer.filter(key => exercises[key].meta.environment !== 'home');
    let includedTracker = [];
    let listOfMuscles;

    if (workout === 'individual') {
        listOfMuscles = muscles;
    } else {
        listOfMuscles = WORKOUTS[workout][muscles[0]];
    }

    listOfMuscles = new Set(shuffleArray(listOfMuscles));
    const arrOfMuscles = Array.from(listOfMuscles);
    const scheme = goal;

    const sets = SCHEMES[scheme].ratio
        .reduce((acc, curr, index) => {
            return [
                ...acc,
                ...[...Array(parseInt(curr)).keys()].map(() =>
                    index === 0 ? 'compound' : 'accessory'
                ),
            ];
        }, [])
        .reduce((acc, curr, index) => {
            const muscleGroupToUse =
                index < arrOfMuscles.length
                    ? arrOfMuscles[index]
                    : arrOfMuscles[index % arrOfMuscles.length];
            return [
                ...acc,
                {
                    setType: curr,
                    muscleGroup: muscleGroupToUse,
                },
            ];
        }, []);

    const { compound: compoundExercises, accessory: accessoryExercises } =
        exer.reduce(
            (acc, curr) => {
                const exerciseMuscles = exercises[curr].muscles;
                const hasRequiredMuscle = exerciseMuscles.some(musc => listOfMuscles.has(musc));

                if (!hasRequiredMuscle) return acc;

                return {
                    ...acc,
                    [exercises[curr].type]: {
                        ...acc[exercises[curr].type],
                        [curr]: exercises[curr],
                    },
                };
            },
            { compound: {}, accessory: {} }
        );

    const genWOD = sets.map(({ setType, muscleGroup }) => {
        const data = setType === 'compound' ? compoundExercises : accessoryExercises;

        const filteredObj = Object.keys(data).reduce((acc, curr) => {
            if (
                includedTracker.includes(curr) ||
                !data[curr].muscles.includes(muscleGroup)
            ) {
                return acc;
            }
            return { ...acc, [curr]: exercises[curr] };
        }, {});

        const filteredDataList = Object.keys(filteredObj);
        const fallbackList = Object.keys(
            setType === 'compound' ? accessoryExercises : compoundExercises
        ).filter(val => !includedTracker.includes(val));

        const randomExercise =
            filteredDataList[Math.floor(Math.random() * filteredDataList.length)] ||
            fallbackList[Math.floor(Math.random() * fallbackList.length)];

        if (!randomExercise) {
            return {};
        }

        let repsOrDuration;
        const isReps = exercises[randomExercise].unit === 'reps';

        if (isReps) {
            const min = Math.min(...SCHEMES[scheme].repRanges);
            const max = Math.max(...SCHEMES[scheme].repRanges);
            repsOrDuration = Math.floor(Math.random() * (max - min + 1)) + min;
            if (setType === 'accessory') {
                repsOrDuration += 4;
            }
        } else {
            repsOrDuration = Math.floor(Math.random() * 40) + 20;
        }

        const tempo = TEMPOS[Math.floor(Math.random() * TEMPOS.length)];

        if (isReps) {
            const tempoSum = tempo.split(' ').reduce((acc, val) => acc + parseInt(val), 0);
            if (tempoSum * repsOrDuration > 85) {
                repsOrDuration = Math.floor(85 / tempoSum);
            }
        } else {
            repsOrDuration = Math.ceil(repsOrDuration / 5) * 5;
        }

        includedTracker.push(randomExercise);

        return {
            name: randomExercise,
            tempo,
            rest: SCHEMES[scheme].rest[setType === 'compound' ? 0 : 1],
            reps: repsOrDuration,
            ...exercises[randomExercise],
        };
    });

    return genWOD.filter(element => Object.keys(element).length > 0);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function exercisesFlattener(exercisesObj) {
    const flattenObj = {};

    for (const [key, val] of Object.entries(exercisesObj)) {
        if (!('variants' in val)) {
            flattenObj[key] = val;
        } else {
            for (const variant in val.variants) {
                const variantName = `${variant}_${key}`;
                const variantSubstitutes = Object.keys(val.variants)
                    .map(element => `${element}_${key}`)
                    .filter(element => element !== variantName);

                flattenObj[variantName] = {
                    ...val,
                    description: `${val.description} ___ ${val.variants[variant]}`,
                    substitutes: [...val.substitutes, ...variantSubstitutes].slice(0, 5),
                };
            }
        }
    }

    return flattenObj;
}
