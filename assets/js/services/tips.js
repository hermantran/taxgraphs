/* @ngInject */
function tips(APP_NAME, APP_VERSION, localStorageService) {
  const service = {};
  let list;

  service.key = `${APP_NAME}Tips${APP_VERSION}`;

  if (!localStorageService.get(service.key)) {
    list = [
      // {
      //   closed: false,
      //   text: 'Hover over or click on the graph to view tax rates at a specific income.',
      // },
    ];
    localStorageService.set(service.key, list);
  }

  service.list = localStorageService.get(service.key);

  service.close = (index) => {
    const key = parseInt(index, 10);
    service.list[key].closed = true;
    localStorageService.set(service.key, service.list);
  };

  return service;
}

export default tips;
