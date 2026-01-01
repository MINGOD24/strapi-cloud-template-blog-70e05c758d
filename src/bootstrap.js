'use strict';

const { global, hero, mission, about, contactInfo, projections, courses } = require('../data/data.json');

async function seedJHEACApp() {
  const shouldImportSeedData = await isFirstRun();

  if (shouldImportSeedData) {
    try {
      console.log('Setting up JHEAC content...');
      await importSeedData();
      console.log('JHEAC content ready!');
    } catch (error) {
      console.log('Could not import seed data');
      console.error(error);
    }
  } else {
    console.log('Seed data has already been imported.');
  }
}

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const initHasRun = await pluginStore.get({ key: 'initHasRun' });
  await pluginStore.set({ key: 'initHasRun', value: true });
  return !initHasRun;
}

async function setPublicPermissions(newPermissions) {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

async function createEntry({ model, entry }) {
  try {
    await strapi.documents(`api::${model}.${model}`).create({
      data: entry,
    });
  } catch (error) {
    console.error({ model, entry, error });
  }
}

async function importGlobal() {
  return createEntry({
    model: 'global',
    entry: {
      ...global,
      publishedAt: Date.now(),
    },
  });
}

async function importHero() {
  return createEntry({
    model: 'hero',
    entry: {
      ...hero,
      publishedAt: Date.now(),
    },
  });
}

async function importMission() {
  return createEntry({
    model: 'mission',
    entry: {
      ...mission,
      publishedAt: Date.now(),
    },
  });
}

async function importAbout() {
  return createEntry({
    model: 'about',
    entry: {
      ...about,
      publishedAt: Date.now(),
    },
  });
}

async function importContactInfo() {
  return createEntry({
    model: 'contact-info',
    entry: {
      ...contactInfo,
      publishedAt: Date.now(),
    },
  });
}

async function importProjections() {
  for (const projection of projections) {
    await createEntry({
      model: 'projection',
      entry: {
        ...projection,
        publishedAt: Date.now(),
      },
    });
  }
}

async function importCourses() {
  for (const course of courses) {
    await createEntry({
      model: 'course',
      entry: {
        ...course,
        publishedAt: Date.now(),
      },
    });
  }
}

async function importSeedData() {
  // Set public permissions for all content types
  await setPublicPermissions({
    global: ['find', 'findOne'],
    hero: ['find', 'findOne'],
    mission: ['find', 'findOne'],
    about: ['find', 'findOne'],
    'contact-info': ['find', 'findOne'],
    projection: ['find', 'findOne'],
    course: ['find', 'findOne'],
  });

  // Import all content
  await importGlobal();
  await importHero();
  await importMission();
  await importAbout();
  await importContactInfo();
  await importProjections();
  await importCourses();
}

module.exports = async () => {
  await seedJHEACApp();
};
