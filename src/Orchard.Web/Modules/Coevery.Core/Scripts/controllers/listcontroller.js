﻿define(['core/app/detourService', 'core/services/commondataservice', 'core/services/columndefinitionservice', 'core/services/viewdefinitionservice'], function (detour) {
    detour.registerController([
      'GeneralListCtrl',
      ['$rootScope', '$scope', '$parse', 'logger', '$detour', '$resource', '$stateParams', '$location', 'commonDataService', 'columnDefinitionService', 'viewDefinitionService',
      function ($rootScope, $scope, $parse, logger, $detour, $resource, $stateParams, $location, commonDataService, columnDefinitionService, viewDefinitionService) {
          var moduleName = $stateParams.Module;
          var primaryKeyGetter = $parse('ContentId');
          $scope.toolButtonDisplay = false;
          $scope.currentViewId = 0;
          $scope.moduleName = moduleName;
          $scope.definitionViews = [];
          $scope.columnDefs = [];

          $rootScope.moduleName = moduleName;
          
          //init pagingoption
          var pageSizes = [50, 100, 200];//[250, 500, 1000];
          var currentPage = parseInt($location.$$search['Page']);
          if (!currentPage) currentPage = 1;
          var pageSize = parseInt($location.$$search['PageSize']);
          if (!pageSize | pageSizes.indexOf(pageSize) < 0) pageSize = 50;//250
          $scope.pagingOptions = {
              pageSizes: pageSizes,
              pageSize: pageSize,
              currentPage: currentPage
          };

          $scope.getPagedDataAsync = function (pageSize, page) {
              $location.search("PageSize", pageSize);
              $location.search("Page", page);
              $stateParams["PageSize"] = pageSize;
              var record = commonDataService.get({ contentType: moduleName, pageSize: pageSize, page: page, viewId: $scope.currentViewId }, function () {
                  $scope.myData = record.EntityRecords;
                  $scope.totalServerItems = record.TotalNumber;
                  if (!$scope.$$phase) {
                      $scope.$apply();
                  }
              }, function () {
                  logger.error("Failed to fetched records for " + moduleName);
              });
          };

          $scope.$watch('pagingOptions', function (newVal, oldVal) {
              if (newVal !== oldVal) {
                  if (newVal.pageSize != oldVal.pageSize) {
                      var maxPage = Math.ceil($scope.totalServerItems / newVal.pageSize);
                      //var currentPage = Math.ceil(oldVal.pageSize * $scope.pagingOptions.currentPage / newVal.pageSize);
                      //if (currentPage > maxPage) currentPage = maxPage;
                      if ($scope.pagingOptions.currentPage > maxPage) {
                          $scope.pagingOptions.currentPage = maxPage;
                          return;
                      }
                  }
                  $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
              }
          }, true);

          $scope.$watch('filterOptions', function (newVal, oldVal) {
              if (newVal !== oldVal) {
                  $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
              }
          }, true);


          $scope.selectedItems = [];

          $scope.gridOptions = {
              data: 'myData',
              enablePaging: true,
              showFooter: true,
              multiSelect: true,
              enableRowSelection: true,
              showSelectionCheckbox: true,
              selectedItems: $scope.selectedItems,
              pagingOptions: $scope.pagingOptions,
              columnDefs: "columnDefs"
          };

          angular.extend($scope.gridOptions, $rootScope.defaultGridOptions);

          // fetch view columns
          $scope.FetchViewColumns = function (viewId) {
              if (viewId <= 0) return;
              if (viewId == $scope.currentViewId) return;
              $scope.currentViewId = viewId;
              $location.search("ViewId", viewId);
              var gridColumns = columnDefinitionService.query({ contentType: moduleName, viewId: viewId }, function () {
                  $scope.columnDefs = gridColumns;
                  $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
              }, function () {
              });
              
          };
          
          $scope.Refresh = function () {
              $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
          };

          // init views
          $scope.FetchDefinitionViews = function() {
              var views = viewDefinitionService.query({ contentType: moduleName}, function () {
                  $scope.definitionViews = views;
                  var defaultViewId = $location.$$search['ViewId'];
                  if (!defaultViewId) {
                      views.forEach(function (value,index) {
                          if (value.Default) {
                              defaultViewId = value.ContentId;
                          }
                      });
                      if (defaultViewId == 0 && views.length > 0)
                          defaultViewId = views[0].ContentId;
                  }
                  $scope.FetchViewColumns(defaultViewId);
              }, function () {
                  logger.error("Failed to fetched views for " + moduleName);
              });
          };

          $scope.CreateView = function () {
              var createViewPath = 'SystemAdmin#/Projections/' + moduleName + '/Create';
              window.location = createViewPath;
          };
          
          $scope.FetchDefinitionViews();

          var idIndex = 1;
          $scope.filters = [{ id: '1' }];
          $scope.addFilter = function () {
              idIndex++;
              $scope.filters.splice($scope.filters.length, 0, { id: idIndex });
          };

          $scope.removeFilter = function (index) {
              $scope.filters.splice(index, 1);
          };

          $scope.expendCollapse = function () {
              if ($('#collapseBtn').hasClass('icon-collapse-hide')) {
                  $('#collapseBtn').removeClass('icon-collapse-hide');
                  $('#collapseBtn').addClass('icon-collapse-show');
                  $('#closeFilterLink').css('display', 'none');
              } else {
                  $('#collapseBtn').removeClass('icon-collapse-show');
                  $('#collapseBtn').addClass('icon-collapse-hide');
                  $('#closeFilterLink').css('display', '');
              }
          };

          $scope.closeFilterCollapse = function () {
              $('#filterCollapse').css('display', 'none');
          };

          $scope.openFilterCollapse = function (fiterId) {
              $('#filterCollapse').css('display', 'block');
              if ($('#collapseBtn').hasClass('icon-collapse-show')) return;
              $('#collapseHeader').click();
              $scope.expendCollapse();
          };

          $scope.delete = function (id) {
              $scope.entityId = id;
              $('#myModalEntity').modal({
                  backdrop: 'static',
                  keyboard: true
              });
          };

          $scope.deleteEntity = function () {
              $('#myModalEntity').modal('hide');
              var id = $scope.$$childTail.entityId;
              var ids = [];
              if (id) {
                  ids.push(id);
              } else {
                  angular.forEach($scope.$$childTail.selectedItems, function (entity) {
                      ids.push(primaryKeyGetter(entity));
                  }, ids);
              }
              commonDataService.delete({ contentId: ids }, function () {
                  $scope.$$childTail.Refresh();
                  logger.success('Delete the entity successful.');
              }, function () {
                  logger.error('Failed to delete the entity');
              });
          };

          $scope.add = function () {
              $detour.transitionTo('Create', { Module: moduleName });
          };

          $scope.edit = function (id) {
              if (!id && $scope.selectedItems.length > 0) {
                  id = primaryKeyGetter($scope.selectedItems[0]);
              }
              $detour.transitionTo('Detail', { Module: moduleName, Id: id });
          };
          $scope.view = function (id) {
              if (!id && $scope.selectedItems.length > 0) {
                  id = primaryKeyGetter($scope.selectedItems[0]);
              }
              $detour.transitionTo('View', { Module: moduleName, Id: id });
          };
      }]
    ]);
});