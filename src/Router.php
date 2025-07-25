<?php

namespace HubletoMain;

use HubletoMain\Controllers\ControllerForgotPassword;
use HubletoMain\Controllers\ControllerResetPassword;
use HubletoMain\Controllers\ControllerSignIn;
use HubletoMain\Controllers\ControllerNotFound;

class Router extends \Hubleto\Framework\Router
{

  public \Hubleto\Framework\Loader $main;

  public function __construct(\Hubleto\Framework\Loader $app)
  {
    parent::__construct($app);

    $this->main = $app;

    $this->httpGet([
      '/^api\/get-apps-info\/?$/' => Api\GetAppsInfo::class,
      '/^api\/log-javascript-error\/?$/' => Api\LogJavascriptError::class,
      '/^api\/dictionary\/?$/' => Api\Dictionary::class,
      '/^api\/get-chart-data\/?$/' =>  Api\GetTemplateChartData::class,
      '/^api\/get-table-columns-customize\/?$/' =>  Api\GetTableColumnsCustomize::class,
      '/^api\/save-table-columns-customize\/?$/' =>  Api\SaveTableColumnsCustomize::class,
      '/^api\/table-export-csv\/?$/' =>  Api\TableExportCsv::class,
      '/^api\/table-import-csv\/?$/' =>  Api\TableImportCsv::class,
      '/^reset-password$/' => ControllerResetPassword::class,
      '/^forgot-password$/' => ControllerForgotPassword::class,
    ]);
  }

  public function createSignInController(): \HubletoMain\Controller
  {
    return new ControllerSignIn($this->main);
  }

  public function createNotFoundController(): \HubletoMain\Controller
  {
    return new ControllerNotFound($this->main);
  }

  public function createResetPasswordController(): \HubletoMain\Controller
  {
    return new ControllerResetPassword($this->main);
  }

  public function createDesktopController(): \HubletoMain\Controller
  {
    return $this->main->di->create(\HubletoApp\Community\Desktop\Controllers\Desktop::class);
  }

  public function httpGet(array $routes): void
  {
    parent::httpGet($routes);
  }

}
