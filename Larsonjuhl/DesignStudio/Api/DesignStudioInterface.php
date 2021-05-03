<?php
namespace Larsonjuhl\DesignStudio\Api;


/**
 * Provides metadata about an attribute.
 *
 * @api
 */

interface DesignStudioInterface
{
	/**
	* set Map Data api
    * @api
    * @param string[] $data
    * @return mixed|string
    */
  public function setMapData($data);

  /**
     * Returns artwork data
     *
     * @api
     * @param string $entity_id
     * @return string artwork data of spefic id.
     */
  public function getMapData($entity_id);


}