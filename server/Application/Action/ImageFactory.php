<?php

declare(strict_types=1);

namespace Application\Action;

use Application\Model\Image;
use Application\Service\ImageResizer;
use Doctrine\ORM\EntityManager;
use Interop\Container\ContainerInterface;

class ImageFactory
{
    public function __invoke(ContainerInterface $container)
    {
        $entityManager = $container->get(EntityManager::class);
        $imageService = $container->get(ImageResizer::class);

        return new ImageAction($entityManager->getRepository(Image::class), $imageService);
    }
}