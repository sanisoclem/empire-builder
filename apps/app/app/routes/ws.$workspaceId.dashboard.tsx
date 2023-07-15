import { Select } from '~components';

export default function Dashboard() {
  return (
    <div className="w-full px-4 pt-6">
      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-6">
        <div className="rounded border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800 sm:p-6 2xl:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold leading-none text-stone-900 dark:text-white sm:text-2xl">
                $435,675
              </span>
              <h3 className="text-base font-light text-stone-500 dark:text-stone-400">Net Worth</h3>
            </div>
            <div className="flex flex-1 items-center justify-end text-base font-medium text-green-500 dark:text-green-400">
              12.5%
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="h-96">Chart Here</div>
          <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-3 dark:border-stone-700 sm:pt-6">
            <div className="flex gap-x-2">
              <Select choices={['Last 7 Days']}></Select>
              <Select choices={['USD']}></Select>
            </div>
            <div className="flex-shrink-0">
              <a
                href="#"
                className="text-primary-700 dark:text-primary-500 inline-flex items-center rounded p-2 text-xs font-medium uppercase hover:bg-stone-100 dark:hover:bg-stone-700 sm:text-sm"
              >
                Net Worth Report
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
        {/*Tabs widget */}
        <div className="rounded border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800 sm:p-6 2xl:col-span-2">
          <h3 className="mb-4 flex items-center text-lg font-semibold text-stone-900 dark:text-white">
            Balance Sheet
            <button
              data-popover-target="popover-description"
              data-popover-placement="bottom-end"
              type="button"
            >
              <svg
                className="ml-2 h-4 w-4 text-stone-400 hover:text-stone-500"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Show information</span>
            </button>
          </h3>
          <ul
            className="hidden divide-x divide-stone-200 rounded text-center text-sm font-medium text-stone-500 dark:divide-stone-600 dark:text-stone-400 sm:flex"
            id="fullWidthTab"
            data-tabs-toggle="#fullWidthTabContent"
            role="tablist"
          >
            <li className="w-full">
              <button
                id="faq-tab"
                data-tabs-target="#faq"
                type="button"
                role="tab"
                aria-controls="faq"
                aria-selected="true"
                className="inline-block w-full rounded-tl-lg bg-stone-50 p-4 hover:bg-stone-100 focus:outline-none dark:bg-stone-700 dark:hover:bg-stone-600"
              >
                Assets
              </button>
            </li>
            <li className="w-full">
              <button
                id="about-tab"
                data-tabs-target="#about"
                type="button"
                role="tab"
                aria-controls="about"
                aria-selected="false"
                className="inline-block w-full rounded-tr-lg bg-stone-50 p-4 hover:bg-stone-100 focus:outline-none dark:bg-stone-700 dark:hover:bg-stone-600"
              >
                Liabilities
              </button>
            </li>
          </ul>

          {/* Card Footer */}
          <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-3 dark:border-stone-700 sm:pt-6">
            <div></div>
            <div className="flex-shrink-0">
              <a
                href="#"
                className="text-primary-700 dark:text-primary-500 inline-flex items-center rounded p-2 text-xs font-medium uppercase hover:bg-stone-100 dark:hover:bg-stone-700 sm:text-sm"
              >
                Full Report
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid w-full grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-4">
        <div className="items-center justify-between rounded border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800 sm:flex sm:p-6">
          <div className="w-full">
            <h3 className="text-base font-normal text-stone-500 dark:text-stone-400">Cash Flow</h3>
            <span className="text-2xl font-bold leading-none text-stone-900 dark:text-white sm:text-3xl">
              +2,340
            </span>
            <p className="flex items-center text-base font-normal text-stone-500 dark:text-stone-400">
              <span className="mr-1.5 flex items-center text-sm text-green-500 dark:text-green-400">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                  />
                </svg>
                12.5%
              </span>
              Since last month
            </p>
          </div>
          <div className="w-full">Chart here</div>
        </div>
        <div className="items-center justify-between rounded border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800 sm:flex sm:p-6">
          <div className="w-full">
            <h3 className="text-base font-normal text-stone-500 dark:text-stone-400">
              Budget Prediction Power
            </h3>
            <span className="text-2xl font-bold leading-none text-stone-900 dark:text-white sm:text-3xl">
              60 days
            </span>
            <p className="flex items-center text-base font-normal text-stone-500 dark:text-stone-400">
              <span className="mr-1.5 flex items-center text-sm text-green-500 dark:text-green-400">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                  />
                </svg>
                3,4%
              </span>
              Since last month
            </p>
          </div>
          <div className="w-full">Chart here</div>
        </div>
        <div className="rounded border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800 sm:p-6 2xl:col-span-2">
          <div className="w-full">
            <h3 className="mb-2 text-base font-normal text-stone-500 dark:text-stone-400">
              Top unplanned expenses
            </h3>
            <div className="mb-2 flex items-center">
              <div className="w-16 text-sm font-medium dark:text-white">Food</div>
              <div className="h-2.5 w-full rounded-full bg-stone-200 dark:bg-stone-700">
                <div
                  className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full"
                  style={{ width: '18%' }}
                />
              </div>
            </div>
            <div className="mb-2 flex items-center">
              <div className="w-16 text-sm font-medium dark:text-white">Games</div>
              <div className="h-2.5 w-full rounded-full bg-stone-200 dark:bg-stone-700">
                <div
                  className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full"
                  style={{ width: '15%' }}
                />
              </div>
            </div>
            <div className="mb-2 flex items-center">
              <div className="w-16 text-sm font-medium dark:text-white">Food</div>
              <div className="h-2.5 w-full rounded-full bg-stone-200 dark:bg-stone-700">
                <div
                  className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full"
                  style={{ width: '60%' }}
                />
              </div>
            </div>
            <div className="mb-2 flex items-center">
              <div className="w-16 text-sm font-medium dark:text-white">Potatoes</div>
              <div className="h-2.5 w-full rounded-full bg-stone-200 dark:bg-stone-700">
                <div
                  className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full"
                  style={{ width: '30%' }}
                />
              </div>
            </div>
          </div>
          <div id="traffic-channels-chart" className="w-full" />
        </div>
      </div>

      {/* 2 columns */}
      <div className="my-4 grid grid-cols-1 xl:grid-cols-2 xl:gap-4">
        {/* Activity Card */}
        <div className="mb-4 rounded border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800 sm:p-6 xl:mb-0">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
              Latest Articles
            </h3>
            <a
              href="#"
              className="text-primary-700 dark:text-primary-500 inline-flex items-center rounded p-2 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-700"
            >
              View all
            </a>
          </div>
          <ol className="relative border-l border-stone-200 dark:border-stone-700">
            <li className="mb-10 ml-4">
              <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-stone-200 dark:border-stone-800 dark:bg-stone-700" />
              <time className="mb-1 text-sm font-normal leading-none text-stone-400 dark:text-stone-500">
                April 2023
              </time>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
                How to use reports
              </h3>
              <p className="mb-4 text-base font-normal text-stone-500 dark:text-stone-400">
                Mauris vehicula ultrices libero, aliquam aliquet risus suscipit at. Aliquam
                porttitor accumsan ipsum at consectetur. Donec vitae augue at felis pretium pretium
                facilisis ut diam. Aenean quis ornare turpis. Sed sit amet elementum leo, id euismod
                urna. Ut cursus urna in lacus ornare sodales. Vivamus eu sollicitudin tellus
              </p>
              <a
                href="#"
                className="hover:text-primary-700 focus:text-primary-700 inline-flex items-center rounded border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white dark:focus:ring-stone-700"
              >
                Learn more{' '}
                <svg
                  className="ml-2 h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </li>
            <li className="mb-10 ml-4">
              <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-stone-200 dark:border-stone-800 dark:bg-stone-700" />
              <time className="mb-1 text-sm font-normal leading-none text-stone-400 dark:text-stone-500">
                March 2023
              </time>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
                An alternative way to look at budgets
              </h3>
              <p className="mb-4 text-base font-normal text-stone-500 dark:text-stone-400">
                Nulla dolor magna, fringilla eu metus sit amet, bibendum venenatis lorem. In quis
                erat vel sem venenatis interdum. Aliquam eget lorem dignissim, laoreet massa eu,
                mollis est. Fusce lectus libero, congue quis posuere ac, hendrerit sit amet sem. In
                accumsan nulla ut ex sodales ultrices. Duis tincidunt ullamcorper felis et
                tristique. Sed malesuada ligula ac metus bibendum posuere. Nulla facilisi. Curabitur
                malesuada odio ut ante dictum eleifend.
              </p>
              <a
                href="https://flowbite.com/blocks/"
                className="text-primary-700 dark:text-primary-500 inline-flex items-center text-xs font-medium hover:underline sm:text-sm"
              >
                Potato
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </li>
            <li className="mb-10 ml-4">
              <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-stone-200 dark:border-stone-800 dark:bg-stone-700" />
              <time className="mb-1 text-sm font-normal leading-none text-stone-400 dark:text-stone-500">
                February 2023
              </time>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
                How to track your stock portfolio
              </h3>
              <p className="text-base font-normal text-stone-500 dark:text-stone-400">
                Cras consequat, elit et fermentum posuere, lorem erat auctor purus, vel tincidunt
                nisi dolor a tortor. Sed at libero id nunc faucibus mollis ut non ante. Quisque
                tortor nunc, accumsan vel diam eget, pharetra luctus magna. Donec ultricies libero
                nibh, at fermentum elit laoreet sit amet. Curabitur sit amet elementum justo, a
                tempus orci. Nullam iaculis consectetur ex sed varius. Integer non ligula ut urna
                luctus hendrerit. Phasellus enim dui, pulvinar non leo eu, maximus finibus urna.
              </p>
            </li>
          </ol>
        </div>
        <div className="rounded border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800 sm:p-6"></div>
      </div>
    </div>
  );
}
